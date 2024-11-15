import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import QRCode from 'qrcode';

function GoogleAuthenticator() {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [secret, setSecret] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [otp, setOtp] = useState('');
  const [isVerified, setIsVerified] = useState(null);
  const token = useSelector((state) => state.auth.user.token);

  useEffect(() => {
    const generateSecret = async () => {
      try {
        // Step 1: Get the secret key and OTP URL from the backend
        const response = await axios.get(`${apiUrl}/google-auth/generate-secret`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const { otpAuthUrl, secret } = response.data;
        setSecret(secret);

        // Step 2: Generate the QR code using the OTP URL
        if (otpAuthUrl) {
          // Generate the QR code from the OTP URL
          const qrCodeUrl = await QRCode.toDataURL(otpAuthUrl); // Converts the URL to a Base64 image
          setQrCodeUrl(qrCodeUrl);
        } else {
          console.error("OTP Auth URL is missing");
        }
      } catch (error) {
        console.error('Error generating secret or QR code:', error);
      }
    };

    generateSecret();
  }, [apiUrl, token]);

  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${apiUrl}/google-auth/verify-otp`, {
        secret,
        otp,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      setIsVerified(response.data.isValid);
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setIsVerified(false);
    }
  };

  return (
    <div>
      <h2 className="text-center">Google Authenticator Setup</h2>

      {secret && qrCodeUrl && (
        <div>
          <h3>Scan this QR code with your Google Authenticator app:</h3>
          <img src={qrCodeUrl} alt="QR Code for Google Authenticator" />
        </div>
      )}

      <form onSubmit={handleOtpSubmit}>
        <label>
          Enter OTP:
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength="6"
          />
        </label>
        <button type="submit">Verify OTP</button>
      </form>

      {isVerified !== null && (
        <div>
          {isVerified ? <p>OTP verified successfully!</p> : <p>Invalid OTP, please try again.</p>}
        </div>
      )}
    </div>
  );
}

export default GoogleAuthenticator;
