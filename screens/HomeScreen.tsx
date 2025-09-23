import React, { useState, useEffect } from 'react';
import { View, FlatList } from 'react-native';
import tw from 'twrnc';
import Navbar from '../components/Navbar';
import TweetInput from '../components/TweetInput';
import TweetCard from '../components/TweetCard';

export default function HomeScreen({ route, navigation }) {
  const { username } = route.params;
  const [tweets, setTweets] = useState([]);
  const [nextId, setNextId] = useState(3);

  useEffect(() => {
    const initialTweets = [
      { id: '1', username: 'Alice', text: 'Hello world! Welcome to The Y!', likes: 5, retweets: 2, comments: 1, time: '1h', avatar: 'https://i.pravatar.cc/50?u=alice' },
      { id: '2', username: 'Bob', text: 'Loving this new app!', likes: 3, retweets: 1, comments: 0, time: '2h', avatar: 'https://i.pravatar.cc/50?u=bob' }
    ];
    setTweets(initialTweets);
  }, []);

  const addTweet = (text) => {
    const newTweet = { id: Date.now().toString(), username, text, likes: 0, retweets: 0, comments: 0, time: 'now', avatar: `https://i.pravatar.cc/50?u=${username}` };
    setTweets([newTweet, ...tweets]);
  };

  const likeTweet = (id) => {
    setTweets(tweets.map(t => t.id === id ? { ...t, likes: t.likes + 1 } : t));
  };

  const loadMoreTweets = () => {
    const moreTweets = Array.from({ length: 3 }).map((_, i) => ({
      id: (nextId + i).toString(),
      username: `User${nextId + i}`,
      text: `This is tweet #${nextId + i}`,
      likes: Math.floor(Math.random() * 10),
      retweets: Math.floor(Math.random() * 5),
      comments: Math.floor(Math.random() * 3),
      time: `${Math.floor(Math.random() * 10) + 1}h`,
      avatar: `https://i.pravatar.cc/50?u=user${nextId + i}`
    }));
    setTweets([...tweets, ...moreTweets]);
    setNextId(nextId + 3);
  };

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <Navbar navigation={navigation} username={username} />
      <View style={tw`p-2 flex-1`}>
        <TweetInput addTweet={addTweet} />
        <FlatList
          data={tweets}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <TweetCard tweet={item} likeTweet={likeTweet} navigation={navigation} />}
          onEndReached={loadMoreTweets}
          onEndReachedThreshold={0.5}
        />
      </View>
    </View>
  );
}
