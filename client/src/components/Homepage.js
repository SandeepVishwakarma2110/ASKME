// Home.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/homepage.css';

function Home({ isLoggedIn }) {
  const [userName, setUserName] = useState('');
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [botInProcess, setBotInProcess] = useState(false);
  const [botReady, setBotReady] = useState(false);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !isLoggedIn) {
      navigate('/login');
      return;
    }

    fetch('api/verify', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Unauthorized');
        }
        return res.json();
      })
      .then((data) => {
        setUserName(data.user.name || 'User');
      })
      .catch((err) => {
        console.error('Token verification failed:', err);
        localStorage.removeItem('token');
        navigate('/login');
      });
  }, [isLoggedIn, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  //Document Upload Function
  const handleFileChange = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setProgress(0);
    setBotInProcess(true);
    setBotReady(false);

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('document', uploadedFile);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const text = await response.text(); // <-- catch error here
      console.log('Raw response text:', text);
      
      const data = JSON.parse(text);
    console.log('Upload response:', data);

      //const data = await response.json();
      //console.log('Upload response:', data);

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setBotInProcess(false);
            setBotReady(true);
            return 100;
          }
          return prev + 10;
        });
      }, 300);
    } catch (err) {
      console.error('Upload error:', err);
      alert('File upload failed. Try again.');
      setBotInProcess(false);
    }
  };

  //Chat message handling
  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    setMessages((prevMessages) => [
      ...prevMessages,
      { text: inputMessage, sender: 'user' }
    ]);
    setInputMessage('');

    try {
      const res = await fetch('/bot-reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputMessage }),
      });

      const data = await res.json();
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: data.reply || 'No response from bot.', sender: 'bot' }
      ]);
    } catch (err) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: 'Bot error. Try again later.', sender: 'bot' }
      ]);
    }
  };




  return (
    <div className="home-container">
      <div className="navbar">
        <div className="logo"> Chat Bot</div>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </div>

      <h2>Welcome, {userName}!</h2>

      <div className="upload-section">
        <input type="file" onChange={handleFileChange} />
        {file && (
          <>
            <div className="progress-bar">
              <div className="progress" style={{ width: `${progress}%` }}></div>
            </div>
            <p>{progress}% Uploaded</p>
          </>
        )}
      </div>

      {botInProcess && <p className="bot-message">🤖 Bot is getting trained with your document...</p>}
      {botReady && <p className="bot-message ready">✅ Now you can ask your question.</p>}

      <div className="chat-section">
        <h3 className="chat-header">Chat with your Bot</h3>

        <div className="chat-window">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        <div className="chat-input-area">
          <textarea
            className="chat-input"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            rows="1"
          />
          <button className="send-button" onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default Home;
