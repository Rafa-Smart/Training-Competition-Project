import React from 'react';
import { useParams } from 'react-router-dom';
import UserProfile from '../components/users/UserProfile';

const ProfilePage = () => {
  const { username } = useParams();

  return <UserProfile username={username} />;
};

export default ProfilePage;