<?php
// app/Http/Controllers/Api/GoogleAuthenticatorController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use PragmaRX\Google2FA\Google2FA;
use Illuminate\Http\Request;


class GoogleAuthenticatorController extends Controller
{
    protected $google2fa;

    public function __construct()
    {
        $this->google2fa = new Google2FA();
    }

    // Generate the QR code based on the secret
    public function generateSecret(Request $request)
    {
        $google2fa = new Google2FA();
    
        // Generate the OTP secret key
        $secret = $google2fa->generateSecretKey();
    
        // User's email (for the QR code label)
        $userEmail = $request->user()->email;
    
        // Generate OTP Auth URL
        $otpAuthUrl = $google2fa->getQRCodeUrl(
            'Myapp',              // App name
            $userEmail,             // User email (identifier)
            $secret,                // Secret key for OTP
            6,                      // Digits (default is 6)
            30                      // Period (default is 30 seconds)
        );
    
        // Optionally, store the secret in the user's record for later OTP verification
        $request->user()->update(['google_2fa_secret' => $secret]);
    
        // Return the secret and OTP Auth URL
        return response()->json([
            'secret' => $secret,
            'otpAuthUrl' => $otpAuthUrl, // Send the OTP URL to the frontend
        ]);
    }
    





    // Verify the OTP entered by the user
    public function verifyOTP(Request $request)
    {
        $secret = $request->input('secret');
        $otp = $request->input('otp');

        // Validate the OTP
        $isValid = $this->google2fa->verifyKey($secret, $otp);

        return response()->json(['isValid' => $isValid]);
    }
}
