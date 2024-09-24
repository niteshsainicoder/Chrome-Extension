import { useState } from 'react';
import './App.css';

function App() {
  const handleButtonClick = () => {
    // Send a message to the content script to insert a button
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id!, { action: 'insertButton' });      
    });
  };



  return (
    < >
      <h1 className='text-md font-medium'>AI Response</h1>
      <button type='button' className='w-fit h-8' onClick={handleButtonClick}>use AI</button>
    </ >
  );
}

export default App;
