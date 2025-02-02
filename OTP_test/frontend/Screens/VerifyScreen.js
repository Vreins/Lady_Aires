import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';



const GenerateOtp = () => {
  const dispatch = useDispatch();
  const username = useSelector((state) => state.user.username);
  const email = useSelector((state) => state.user.email); // Assuming email is also stored
  const [otp, setOtp] = useState('');
  const generateOtpHandler = async () => {
    try {
      const response = await axios.post('/api/generate-otp', { username, email });
      alert(response.data); // Display success message
    } catch (error) {
      alert('Error generating OTP');
    }
  };

  
  const verifyOtpHandler = async () => {
    try {
      const response = await axios.post('/api/verify-otp', { username, otp });
      alert(response.data); // Display success message
    } catch (error) {
      alert('Error verifying OTP');
    }
  };

  return (
    <div>
        <div>
        <h2>Generate OTP</h2>
        <button onClick={generateOtpHandler}>Generate OTP</button>
        </div>

      <div>
      <h2>Verify OTP</h2>
      <input
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="Enter OTP"
      />
      <button onClick={verifyOtpHandler}>Verify OTP</button>

    </div>
</div>
    
  );
};

export default GenerateOtp;