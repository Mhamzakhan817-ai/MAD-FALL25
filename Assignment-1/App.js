import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  useColorScheme,
} from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

// Dummy User
const user = {
  name: 'Hamza Khan',
  skills: ['React Native', 'Guitar', 'Photography', 'Sports'],
  bio: 'A passionate developer, musician, and sportsperson looking to share my skills with the world.',
};

//Theme Context 
const ThemeContext = createContext();

function useTheme() {
  return useContext(ThemeContext);
}

//Screens 

// 1. Login Screen
function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { themeStyles } = useTheme();

  const handleLogin = () => {
    if (email === '8628@student.com' && password === 'abasyn123') {
      setError('');
      navigation.replace('Home');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, themeStyles.container]}>
      <Text style={[styles.header, themeStyles.text]}>Login</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={[styles.input, themeStyles.input]}
        placeholderTextColor={themeStyles.placeholder.color}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        style={[styles.input, themeStyles.input]}
        placeholderTextColor={themeStyles.placeholder.color}
      />
      {error ? <Text style={[styles.error, themeStyles.text]}>{error}</Text> : null}
      <Button title="Login" onPress={handleLogin} />
    </ScrollView>
  );
}

// 2. Home Feed
function HomeScreen({ navigation, route }) {
  const [offers, setOffers] = useState([
    { id: '1', title: 'Python Tutoring', user: 'Ali' },
    { id: '2', title: 'Guitar Lessons', user: 'Fatima' },
    { id: '3', title: 'Drawing Basics', user: 'Ahmed' },
    { id: '4', title: 'Yoga & Meditation', user: 'Sara' },
  ]);
  const { themeStyles, toggleTheme, isDark } = useTheme();

  useEffect(() => {
    if (route.params?.newOffer) {
      const newOffer = {
        id: Date.now().toString(),
        ...route.params.newOffer,
      };
      setOffers((prev) => [...prev, newOffer]);
    }
  }, [route.params?.newOffer]);

  return (
    <View style={[styles.container, themeStyles.container]}>
      <Text style={[styles.header, themeStyles.text]}>Skill Offers</Text>

      {/* No alternating colors, just theme-based cards */}
      <FlatList
        data={offers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, themeStyles.card]}
            onPress={() => navigation.navigate('OfferDetail', { offer: item })}
          >
            <Text style={[styles.cardTitle, themeStyles.text]}>{item.title}</Text>
            <Text style={themeStyles.text}>By {item.user}</Text>
          </TouchableOpacity>
        )}
      />

      <View style={styles.buttonGroup}>
        <Button title="Create Post" onPress={() => navigation.navigate('CreatePost')} />
        <Button title="Profile" onPress={() => navigation.navigate('Profile')} />
      </View>

      <View style={{ marginTop: 20 }}>
        <Text style={themeStyles.text}>Dark Mode</Text>
        <Switch value={isDark} onValueChange={toggleTheme} />
      </View>
    </View>
  );
}

// 3. Create Post
function CreatePostScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const { themeStyles } = useTheme();

  const handlePost = () => {
    if (!title.trim()) {
      alert('Title is required.');
      return;
    }
    if (!desc.trim()) {
      alert('Description is required.');
      return;
    }

    const newOffer = { title, user: 'You', desc };
    navigation.navigate('Home', { newOffer });
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, themeStyles.container]}>
      <Text style={[styles.header, themeStyles.text]}>Create a New Skill Offer</Text>
      <TextInput
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        style={[styles.input, themeStyles.input]}
        placeholderTextColor={themeStyles.placeholder.color}
      />
      <TextInput
        placeholder="Description"
        value={desc}
        onChangeText={setDesc}
        style={[styles.input, themeStyles.input]}
        placeholderTextColor={themeStyles.placeholder.color}
      />
      <Button title="Post" onPress={handlePost} />
    </ScrollView>
  );
}

// 4. Offer Detail Page
function OfferDetailScreen({ route }) {
  const { offer } = route.params;
  const { themeStyles } = useTheme();

  return (
    <ScrollView contentContainerStyle={[styles.container, themeStyles.container]}>
      <Text style={[styles.header, themeStyles.text]}>{offer.title}</Text>
      <Text style={[styles.label, themeStyles.text]}>By: {offer.user}</Text>
      <Text style={[styles.label, themeStyles.text]}>
        Description: {offer.desc || 'No description given.'}
      </Text>
    </ScrollView>
  );
}

// 5. Profile
function ProfileScreen() {
  const { themeStyles } = useTheme();

  return (
    <ScrollView contentContainerStyle={[styles.container, themeStyles.container]}>
      <Text style={[styles.header, themeStyles.text]}>{user.name}</Text>
      <Text style={[styles.label, themeStyles.text]}>Bio:</Text>
      <Text style={[styles.paragraph, themeStyles.text]}>{user.bio}</Text>
      <Text style={[styles.label, themeStyles.text]}>Skills:</Text>

      {/* Just plain text, no background color */}
      {user.skills.map((skill, idx) => (
        <Text key={idx} style={[styles.paragraph, themeStyles.text]}>
          • {skill}
        </Text>
      ))}
    </ScrollView>
  );
}

// Theme Provider
function AppWrapper() {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  const toggleTheme = () => setIsDark((prev) => !prev);

  const themeStyles = isDark
    ? {
        container: { backgroundColor: '#121212' },
        text: { color: '#FFFFFF' },
        input: { backgroundColor: '#1E1E1E', color: '#FFF', borderColor: '#333' },
        card: { backgroundColor: '#1F1F1F', borderColor: '#333' },
        placeholder: { color: '#999' },
      }
    : {
        container: { backgroundColor: '#F5F5F5' },
        text: { color: '#000000' },
        input: { backgroundColor: '#FFFFFF', color: '#000', borderColor: '#CCC' },
        card: { backgroundColor: '#FFFFFF', borderColor: '#DDD' },
        placeholder: { color: '#888' },
      };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, themeStyles }}>
      <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
        <App />
      </NavigationContainer>
    </ThemeContext.Provider>
  );
}

//App Navigation
function App() {
  return (
    <Stack.Navigator
      screenOptions={{ headerStyle: { backgroundColor: '#6200ee' }, headerTintColor: '#fff' }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Skill Feed' }} />
      <Stack.Screen name="CreatePost" component={CreatePostScreen} />
      <Stack.Screen name="OfferDetail" component={OfferDetailScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}
//STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    justifyContent: 'flex-start',
  },
  input: {
    borderWidth: 1,
    marginBottom: 8,
    padding: 6,
    borderRadius: 4,
    fontSize: 12,
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 6,
  },
  header: {
    fontSize: 16,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
  paragraph: {
    fontSize: 12,
    marginBottom: 8,
  },
  card: {
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    borderWidth: 1,
    elevation: 1,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  buttonGroup: {
    marginTop: 10,
    gap: 8,
  },
});

//export app
export default AppWrapper;
