import React, { useState } from 'react';
import axios from 'axios';
import SignUpForm from './SignUpForm';
import LoginForm from './LoginForm';

const UserProfile = () => {

    const [isSignUp, setIsSignUp] = useState(true);
    
    const toggleForm = () => {
        setIsSignUp(!isSignUp);
    };

    return (
        <div>
            <h2>User Profile</h2>
            {isSignUp ? (
                <>
                <p>Already have an account? <button onClick={toggleForm}>Log In</button></p>
                <SignUpForm/>
                </>
            ) : (
                <>
                <p>Don't have an account? <button onClick={toggleForm}>Sign Up</button></p>
                <LoginForm />
                </>
            )}
        </div>
    );
};

export default UserProfile;
