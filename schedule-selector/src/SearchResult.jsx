import React, { Component } from 'react';

class SearchResult extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isPending: false
    };
  }

  handleAddFriend = () => {
    this.setState({ isPending: true });
    // Logic to send friend request or perform necessary actions
    // After the request is processed, update the state accordingly
  };

  handleCancelRequest = () => {
    this.setState({ isPending: false });
    // Logic to cancel the friend request or perform necessary actions
    // After the cancellation is processed, update the state accordingly
  };

  render() {
    const { isPending } = this.state;
    const { username } = this.props;

    return (
      <div>
        <span>{username}</span>
        {isPending ? (
          <>
            <span>Pending</span>
            <button onClick={this.handleCancelRequest}>x</button>
          </>
        ) : (
          <button onClick={this.handleAddFriend}>Add Friend</button>
        )}
      </div>
    );
  }
}

export default SearchResult;
