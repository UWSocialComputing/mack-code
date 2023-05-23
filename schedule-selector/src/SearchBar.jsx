import React, { Component } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import getFirebaseConfig from './firebase-config';
import SearchResult from './SearchResult';

const firebaseConfig = getFirebaseConfig;
const app = firebase.initializeApp(firebaseConfig)

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
            .where('username', '>=', searchQuery)
            .where('username', '<=', searchQuery + '\uf8ff')
            .get()
            .then((querySnapshot) => {
                const results = [];
                querySnapshot.forEach((doc) => {
                    console.log(doc.data);
                    results.push(doc.data().username);
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
                className="w-full placeholder-gray-400 text-gray-900 p-4"
                placeholder="Search"
                onChange={this.handleInputChange}
                value={searchQuery}
            />
            <button className="bg-white p-4">🔍</button>
        </div>
        <div>
            {searchResults.length > 0 ? (
            <div>
                {searchResults.map((user, index) => (
                <SearchResult username={user}></SearchResult>
                ))}
            </div>
            ) : (
            <p>No users found</p>
            )}
        </div></>
        );
    }
}

export default SearchBar;