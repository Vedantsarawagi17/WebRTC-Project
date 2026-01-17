import { useEffect } from "react";
import { VideoState } from "../context/VideoProvider";
import { FaPhone, FaPhoneSlash } from "react-icons/fa";

const VideoCallModal = () => {
  const { 
    stream, remoteStream,
    myVideo, userVideo,
    receivingCall, callerName, 
    answerCall, callAccepted, leaveVideoCall
  } = VideoState();

  // Attach local stream if available (Safety check)
  useEffect(() => {
     if(myVideo.current && stream) {
         myVideo.current.srcObject = stream;
     }
  }, [stream, myVideo]);

  // Attach remote stream safely (Fixes race condition)
  useEffect(() => {
    if(userVideo.current && remoteStream) {
        console.log("Attaching Remote Stream to Video Element");
        userVideo.current.srcObject = remoteStream;
    }
 }, [remoteStream, userVideo, callAccepted]);

  // If no active call flow (no stream and no incoming request), return null.
  // Exception: If receiving call but no stream yet (we haven't answered), showing modal is good.
  if (!stream && !receivingCall) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
       
       <h2 className="text-white text-2xl font-bold mb-8">
           {callAccepted ? "Video Call Active" : receivingCall ? `Incoming Call from ${callerName}` : "Calling..."}
       </h2>

       <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl justify-center items-center">
            
            {/* My Video (Always show if stream exists) */}
            {stream && (
              <div className="relative">
                  <video playsInline muted ref={myVideo} autoPlay className="w-[300px] h-[225px] md:w-[480px] md:h-[360px] object-cover rounded-xl border-2 border-blue-500 bg-gray-800 shadow-2xl" style={{ transform: "scaleX(-1)" }} />
                  <p className="absolute bottom-2 left-2 text-white bg-black/50 px-2 rounded text-sm font-semibold">You</p>
              </div>
            )}

            {/* User Video (Show only if accepted) */}
            {callAccepted && (
                 <div className="relative">
                    <video playsInline ref={userVideo} autoPlay className="w-[300px] h-[225px] md:w-[480px] md:h-[360px] object-cover rounded-xl border-2 border-green-500 bg-gray-800 shadow-2xl" style={{ transform: "scaleX(-1)" }} />
                    <p className="absolute bottom-2 left-2 text-white bg-black/50 px-2 rounded text-sm font-semibold">Remote User</p>
                 </div>
            )}
       </div>

       {/* Controls */}
       <div className="mt-8 flex gap-6">
            {receivingCall && !callAccepted && (
                <button onClick={answerCall} className="px-8 py-3 bg-green-500 hover:bg-green-600 rounded-full text-white font-bold flex items-center gap-2 shadow-lg transition transform hover:scale-105">
                    <FaPhone /> Accept Call
                </button>
            )}

            <button onClick={leaveVideoCall} className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-full text-white font-bold flex items-center gap-2 shadow-lg transition transform hover:scale-105">
                 <FaPhoneSlash /> End Call
            </button>
       </div>

    </div>
  );
};

export default VideoCallModal;
