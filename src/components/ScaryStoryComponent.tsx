// src/components/ScaryStoryComponent.tsx
import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';

export function ScaryStoryComponent() {
  const [storyProgress, setStoryProgress] = useState(0);
  const [userResponses, setUserResponses] = useState([]);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [poster, setPoster] = useState(null);
  const webcamRef = useRef(null);

  const storySegments = [
    {
      text: "It was a dark and stormy night. You find yourself in front of an old, abandoned house.",
      question: "Do you want to enter the house?",
      options: ["Yes", "No"],
    },
    {
      text: "As you step inside, the door slams shut behind you. You hear strange noises coming from upstairs.",
      question: "Do you investigate the noise or try to find a way out?",
      options: ["Investigate", "Find a way out"],
    },
    {
      text: "You see a shadowy figure at the end of the hallway. It seems to be beckoning you.",
      question: "Do you approach the figure or run away?",
      options: ["Approach", "Run away"],
    },
    {
      text: "Congratulations! You've survived the haunted house adventure.",
      question: "Would you like to generate a poster of your story?",
      options: ["Yes", "No"],
    },
  ];

  const captureImage = useCallback(async () => {
    setIsCapturing(true);
    const imageSrc = webcamRef.current.getScreenshot();
    
    // Upload to Cloudinary
    const formData = new FormData();
    formData.append('file', imageSrc);
    formData.append('upload_preset', 'your_upload_preset');

    const response = await fetch('https://api.cloudinary.com/v1_1/your_cloud_name/image/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate AI image
    const aiResponse = await fetch('https://api.cloudinary.com/v1_1/your_cloud_name/image/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your_api_key',
      },
      body: JSON.stringify({
        prompt: `A scary scene with a person: ${storySegments[storyProgress].text}`,
        image_url: data.secure_url,
      }),
    });

    const aiData = await aiResponse.json();
    setGeneratedImage(aiData.secure_url);
    setIsCapturing(false);
  }, [storyProgress]);

  const handleResponse = async (response) => {
    setUserResponses([...userResponses, response]);
    
    if (storyProgress < storySegments.length - 1) {
      await captureImage();
      setStoryProgress(storyProgress + 1);
    } else {
      // Generate final poster
      const posterResponse = await fetch('https://api.cloudinary.com/v1_1/your_cloud_name/image/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer your_api_key',
        },
        body: JSON.stringify({
          prompt: `A movie poster for a scary story titled "A Night in the Haunted House" featuring scenes: ${storySegments.map(s => s.text).join(', ')}`,
        }),
      });

      const posterData = await posterResponse.json();
      setPoster(posterData.secure_url);
    }
  };

  return (
    <div>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        style={{ display: 'none' }}
      />
      
      {storyProgress < storySegments.length && (
        <div>
          <p>{storySegments[storyProgress].text}</p>
          <p>{storySegments[storyProgress].question}</p>
          {storySegments[storyProgress].options.map((option, index) => (
            <button key={index} onClick={() => handleResponse(option)} disabled={isCapturing}>
              {option}
            </button>
          ))}
        </div>
      )}

      {isCapturing && <p>Capturing and processing image...</p>}
      
      {generatedImage && (
        <img src={generatedImage} alt="AI generated scene" style={{ maxWidth: '100%' }} />
      )}

      {poster && (
        <div>
          <h2>Your Story Poster</h2>
          <img src={poster} alt="Story poster" style={{ maxWidth: '100%' }} />
        </div>
      )}
    </div>
  );
}