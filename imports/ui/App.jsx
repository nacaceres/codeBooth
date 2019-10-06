import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import Auth from './Auth';
import '../styles/App.css';
import Profile from './Profile';
import Editor from './Editor';
import Loader from './Loader';
import { call } from '../utils/mongo';

const App = ({ user }) => {

  const [state, setState] = useState(0);
  const [profileState, setProfileState] = useState(1);
  const [toast, setToast] = useState(undefined);
  const [document, setDocument] = useState(undefined);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (toast) {
      const timeout = setTimeout(() => setToast(undefined), 3000);
      return () => clearTimeout(timeout);
    }
  }, [toast]);

  useEffect(() => {
    const logged = !!Meteor.userId();

    if (state !== 3) {
      if (!logged && state === 0) {
        setState(1);
      }
      else if (logged) {
        setState(2);
      }
    }
  }, [user, state]);

  useEffect(() => {
    if (document) {
      setState(3);
    }
  }, [document]);

  const showDocument = (d) => {
    setDocument(d);
  };

  const showToast = (to) => setToast(to);

  const goMenu = (i) => {
    setState(2);
    setProfileState(i);
    setShowMenu(false);
  };

  const createDoc = () => {
    setDocument(undefined);
    setState(3);
  };

  const logOut = () => {
    Meteor.logout(() => {
      setState(0);
    });
  };

  const saveShare = (docId, shares) => {
    (async () => {
      const rta = await call('document.setShares', docId, shares);
      console.log(rta);
    })();
  };

  const renders = {
    0: <Loader />,
    1: <Auth changeState={setState} showToast={showToast} />,
    2: <Profile createDoc={createDoc} showDocument={showDocument} status={profileState} logout={logOut} />,
    3: <Editor showToast={showToast} documentId={document ? document._id : undefined} showDocument={showDocument} saveShare={saveShare} />
  };

  return (
    <div>
      <div id="header" className={state === 3 ? 'no-shadow' : ''}>
        <h1>Code Booth</h1>
        <div id="right-menu" className={state === 3 ? '' : 'hidden'}>
          <button onClick={() => setShowMenu(s => !s)}>
            <i className="fas fa-user-circle"></i>
          </button>
          <div className={showMenu ? '' : 'hidden'}>
            <button onClick={() => goMenu(0)}>Explore</button>
            <button onClick={() => goMenu(1)}>Dashboard</button>
            <button onClick={() => goMenu(2)}>Settings</button>
            <button onClick={logOut}>Log Out</button>
          </div>
        </div>
      </div>
      <div id="content">
        {renders[state]}
      </div>
      <div id="toast" className={toast ? toast.state : ''}>{toast ? toast.msg : ''}</div>
    </div>
  );
};

App.propTypes = {
  user: PropTypes.object
};

export default withTracker(() => {
  return {
    user: Meteor.user()
  };
})(App);
