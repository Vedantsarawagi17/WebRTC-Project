import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { ChatState } from "./ChatProvider";

const VideoContext = createContext();

export const VideoProvider = ({ children }) => {
  const { socket, user, selectedChat } = ChatState();

  // --- Raw WebRTC State ---
  const [callAccepted, setCallAccepted] = useState(false);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callerName, setCallerName] = useState("");
  const [stream, setStream] = useState();
  const [remoteStream, setRemoteStream] = useState();

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const localStream = useRef();
  const candidateQueue = useRef([]);

  const processCandidate = async (candidate) => {
    if (connectionRef.current && connectionRef.current.remoteDescription && connectionRef.current.remoteDescription.type) {
        try {
            await connectionRef.current.addIceCandidate(candidate);
        } catch (e) {
            console.error("Error adding ice candidate:", e);
        }
    } else {
        console.log("Buffering ICE candidate (Remote description not set yet)");
        candidateQueue.current.push(candidate);
    }
  };

  useEffect(() => {
    if(!socket) return;
    
    socket.on("incomingCall", (data) => {
        setReceivingCall(true);
        setCaller(data.from);
        setCallerName(data.name);
        setCallerSignal(data.signal);
        toast.info(`${data.name} is calling...`);
    });

    socket.on("iceCandidate", async (candidate) => {
        processCandidate(candidate);
    });

    return () => {
        socket.off("incomingCall");
        socket.off("iceCandidate");
    };
  }, [socket]);

  // Helper: Create Peer & Add Local Stream
  const createPeer = (targetUserId) => {
      const peer = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
      });

      if(localStream.current) {
         localStream.current.getTracks().forEach(track => {
             peer.addTrack(track, localStream.current);
         });
      }

      peer.ontrack = (event) => {
          console.log("Remote Stream Received");
          setRemoteStream(event.streams[0]);
          if(userVideo.current) {
              userVideo.current.srcObject = event.streams[0];
          }
      };

      peer.onicecandidate = (event) => {
          if (event.candidate) {
              socket.emit("iceCandidate", { to: targetUserId, candidate: event.candidate });
          }
      };
      
      return peer;
  };

  const callUser = async () => {
      if(!selectedChat) return toast.warn("Select a chat first!");
      const otherUser = selectedChat.users.find(u => u._id !== user._id);
      if(!otherUser) return;
      
      try {
          // HD Constraints
          const currentStream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: true });
          localStream.current = currentStream;
          setStream(currentStream);
          if(myVideo.current) myVideo.current.srcObject = currentStream;

          const peer = createPeer(otherUser._id);
          connectionRef.current = peer;

          const offer = await peer.createOffer();
          await peer.setLocalDescription(offer);

          socket.emit("callUser", {
              userToCall: otherUser._id,
              signalData: offer,
              from: user._id,
              name: user.name
          });

          socket.on("callAccepted", async (signal) => {
               setCallAccepted(true);
               await peer.setRemoteDescription(new RTCSessionDescription(signal));
               
               // Flush candidate queue
               while (candidateQueue.current.length > 0) {
                 const candidate = candidateQueue.current.shift();
                 await processCandidate(candidate);
               }
          });
      } catch (err) {
          console.error("Camera Error:", err);
          toast.error("Failed to access camera/mic");
      }
  };

  const answerCall = async () => {
      try {
           // HD Constraints here too for answering usage
          const currentStream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: true });
          localStream.current = currentStream;
          setStream(currentStream);
          if(myVideo.current) myVideo.current.srcObject = currentStream;
          
          setCallAccepted(true);
          const peer = createPeer(caller);
          connectionRef.current = peer;

          await peer.setRemoteDescription(new RTCSessionDescription(callerSignal));
          
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          
          // Flush candidate queue
          while (candidateQueue.current.length > 0) {
             const candidate = candidateQueue.current.shift();
             await processCandidate(candidate);
          }

          socket.emit("answerCall", { to: caller, signal: answer });
          setReceivingCall(false); 
      } catch (err) {
          console.error("Answer Error:", err);
      }
  };

  const leaveVideoCall = () => {
      if(connectionRef.current) connectionRef.current.close();
      window.location.reload();
  };
  
  // Alias for UI button
  const joinVideoRoom = () => {
      callUser();
  };

  return (
    <VideoContext.Provider
      value={{
        stream, remoteStream,
        myVideo, userVideo,
        joinVideoRoom, leaveVideoCall,
        receivingCall, callerName, answerCall, callAccepted,
        callUser
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};

export const VideoState = () => {
  return useContext(VideoContext);
};
