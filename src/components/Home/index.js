import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import AccountRow from '../Common/AccountRow';
import { getAccountList,getAccountListWithMapping } from '../../common/services/restclient';

class Home extends Component {
  state = {
    loading: false,
    accountList: []
  };

  componentDidMount() {
    this._getAccountList();
  }

  _handleLogout = () => {
    localStorage.clear();
    localStorage.setItem('logout', true);
    browserHistory.replace('/home');
    this.setState({ logout: true });
  };

  _handleLogin = () => {
    localStorage.setItem('logout', false);
    browserHistory.replace('/');
    this.setState({ logout: false });
  };

  _getAccountList = () => {
      getAccountListWithMapping()
      .then((response) => {
        const state = Object.assign({}, this.state);
        state.loading = false;
        if (response !== 'undefine' && response !== null && response.records !== 'undefine') state.accountList = response.records;

        this.setState(state);
      })
      .catch((error) => {
        this.setState({ error, loading: false });
      });
  };

  render() {
    return (
      <div className="container">
        {
          (this.state.logout === true)
            ? <button onClick={this._handleLogin}>Login</button>
            : <button onClick={this._handleLogout}>Logout</button>
        }

        {!this.state.loading && this.state.logout !== true &&
          <div className="list-group">
            {this.state.accountList.map(account => (<AccountRow key={account.Id} account={account} />))}
          </div>}
      </div>
    );
  }
}

export default Home;
