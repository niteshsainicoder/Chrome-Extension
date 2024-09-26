import { useState } from 'react';
import './App.css';

function App() {
  
  const [button, setbutton] = useState<boolean>(false);
  useEffect(() => {
    if (button) {

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id!, { action: 'insertButton' });
      });
    }else{

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id!, { action: 'removeButton' });
      });
    }
  }, [button])
  return (
    < div className={`maindiv`}>
      <h1 className={``}>AI Response</h1>
      <div onClick={() => setbutton(!button)} className={`buttondiv ${button ? 'onbutton' : ''} w-16 cursor-pointer h-4 rounded-lgflex justify-start items-center `}>
        <span  className={` ${button ? 'togglebutton' : ''} button`}>{button ? 'on' : 'off'}</span>
      </div>    </ div>
  );
}

export default App;
