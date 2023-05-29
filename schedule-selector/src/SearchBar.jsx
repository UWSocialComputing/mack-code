import React, { Component } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import SearchResult from './SearchResult';
import { getAuth} from "firebase/auth";
import getFirebaseConfig from './firebase-config';
import './LoginForm.css'
import './Profile.css'

const config = getFirebaseConfig;
const firebaseApp = firebase.initializeApp(config);
const auth = getAuth(firebaseApp);

class SearchBar extends Component {
    constructor(props) {
      super(props);
      this.state = {
        searchQuery: '',
        searchResults: []
      };
    }
    
    handleInputChange = (event) => {
        const { value } = event.target;
        this.setState({ searchQuery: value }, () => {
            this.performSearch();
        });
    };

    performSearch = () => {
        const { searchQuery } = this.state;
        const db = firebase.firestore();

        const usersRef = db.collection('users');
      
        // Query the users collection based on the search query
        usersRef
            .where('email', '>=', searchQuery)
            .where('email', '<=', searchQuery + '\uf8ff')
            .get()
            .then((querySnapshot) => {
                const results = [];
                querySnapshot.forEach((doc) => {
                    const email = doc.data().email
                    if(!(email === auth.currentUser.email || this.props.friends.includes(email) || this.props.requestsSent.includes(email) || this.props.requestsRecieved.includes(email))) {
                        console.log(doc.data);
                        results.push(doc.data().email);
                    }
                });
                this.setState({ searchResults: results.slice(0, 5) });
            })
            .catch((error) => {
                console.error('Error searching users:', error);
        });
    };

    render() {
        const { searchQuery, searchResults } = this.state;
        return (
        <><div className="w-full max-w-xl flex mx-auto p-20 text-xl">
            <input
                type="text"
                className="w-full placeholder-gray-400 text-gray-900 p-4 searching"
                placeholder="Find Friends"
                onChange={this.handleInputChange}
                value={searchQuery}
            />
            <button style={{ fontSize: '15px', padding: '10px 20px' }} className="bg-white p-4">🔍</button>
        </div>
        <div>
            {searchResults.length > 0 ? (
            <div>
                <ul>
                {searchResults.map((email, index) => (
                <SearchResult email={email}></SearchResult>
                ))}
                </ul>
            </div>
            ) : (
            <ul>
            <p>No users found</p>
            </ul>
            )}
        </div></>
        );
    }
}

export default SearchBar;
