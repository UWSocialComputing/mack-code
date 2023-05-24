import React, { useState } from 'react';
import axios from 'axios';
import SignUpForm from './SignUpForm';
import LoginForm from './LoginForm';
import './LoginForm'

const UserProfile = () => {

    const [isSignUp, setIsSignUp] = useState(true);
    
    const toggleForm = () => {
        setIsSignUp(!isSignUp);
    };

    return (
        <div>
            {/* <h2>User Profile</h2> */}
            {isSignUp ? (
                <div className="centered-element">
                <>
                
                <SignUpForm/>
                <p>Already have an account? <button style={{ textDecoration: 'underline' }} className="button button-alt" onClick={toggleForm}>Log In</button></p>
                
                </>
                </div>
            ) : (
                <div className="centered-element">
                <>
                <LoginForm />
                
                <p >Don't have an account? <button style={{ textDecoration: 'underline' }} className="button button-alt" onClick={toggleForm}>Sign Up</button></p>
                </>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
