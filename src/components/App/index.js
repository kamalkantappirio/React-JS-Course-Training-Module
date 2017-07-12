import React, { Component, PropTypes } from 'react';
import { browserHistory } from 'react-router';
import { API_CONST, ENVIRONMENT } from '../../common/constants';

class App extends Component {
  componentDidMount() {
    const { location } = this.props;
    const token = location.query.access_token || localStorage.getItem('accessToken');
    const instanceUrl = location.query.instance_url || localStorage.getItem('instanceUrl');

    if (token) {
      localStorage.setItem('accessToken', token);
      localStorage.setItem('instanceUrl', instanceUrl);
      browserHistory.replace('/home');
    } else {
      window.location.href = `${ENVIRONMENT.API_ROOT}${API_CONST.LOGIN}`;
    }
  }

  render() {
    return (
      <div className="container">
        {/* <Header auth={this.props.route.auth} />*/}
      </div>
    );
  }
}

App.propTypes = {
  location: PropTypes.string
};

App.defaultProps = {
  location: ''
};

export default App;
