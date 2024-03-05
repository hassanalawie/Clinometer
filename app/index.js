import React, { useState, useEffect } from 'react';
import { Text, View, Button, StyleSheet } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { Picker } from '@react-native-picker/picker';
import { Camera } from 'expo-camera';


const Home = () => {
  const [data, setData] = useState({ x: 0, y: 0, z: 0 });
  const [capturedAngles, setCapturedAngles] = useState([]);
  const [distance, setDistance] = useState('5');
  const [overallLength, setOverallLength] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    Accelerometer.setUpdateInterval(100);

    const subscription = Accelerometer.addListener(accelerometerData => {
      setData(accelerometerData);
    });

    return () => subscription.remove();
  }, []);

  const calculateTiltAngle = ({ x, y, z }) => {
    let tilt = Math.atan2(y, z) + Math.PI / 2;
    if (tilt > Math.PI) {
      tilt -= 2 * Math.PI;
    }
    tilt = tilt * (180 / Math.PI); // Convert from radians to degrees
    return tilt;
  };

  const handleCapture = () => {
    const angle = calculateTiltAngle(data);
    setCapturedAngles(prevAngles => {
      const newAngles = [...prevAngles, angle];
      if (newAngles.length > 2) {
        return [angle];
      }
      return newAngles;
    });
  };

  useEffect(() => {
    if (capturedAngles.length === 2) {
      const length = calculateOverallLength(capturedAngles, distance);
      setOverallLength(length);
    }
  }, [capturedAngles, distance]);

  const calculateOverallLength = (angles, distanceValue) => {
    const dist = parseInt(distanceValue);
    const angle1 = angles[0];
    const angle2 = angles[1];
    // Use Math.abs to get the absolute value of each term
    const length = Math.abs(dist * Math.tan(angle1 * (Math.PI / 180))) + Math.abs(dist * Math.tan(angle2 * (Math.PI / 180)));
    return length.toFixed(3);
  };
  

  const tiltAngle = calculateTiltAngle(data).toFixed(3);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={Camera.Constants.Type.back}
      ><View style={styles.redDot} /></Camera>
      <View style={styles.appContainer}>
        <View style={styles.angleContainer}>
          <Text style={styles.angleText}>Tilt Angle: {Math.round(tiltAngle)}°</Text>
          <Button title="Capture Angle" onPress={handleCapture} />
        </View>

        <View style={styles.pickerContainer}>
        <Picker
            selectedValue={distance}
            style={styles.picker}
            onValueChange={(itemValue) => setDistance(itemValue)}
        >
            {[...Array(10).keys()].map((value) => (
            <Picker.Item key={value} label={`${value + 1} meters`} value={`${value + 1}`} />
            ))}
        </Picker>
        </View>

        {overallLength && capturedAngles.length === 2 && (
          <View style={styles.lengthContainer}>
            <Text style={styles.lengthText}>Overall Length: {overallLength} meters</Text>
          </View>
        )}

        {capturedAngles.length > 0 && (
          <View style={styles.capturedAnglesContainer}>
            <Text style={styles.capturedAnglesText}>Captured Angles:</Text>
            {capturedAngles.map((angle, index) => (
              <Text key={index} style={styles.angleText}>
                {Math.round(angle)}°
              </Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
    },
    camera: {
      flex: 1, // Take up half of the screen
      alignItems: 'center',
      justifyContent: 'center',
    },
    appContainer: {
      flex: 1, // Take up the other half of the screen
      backgroundColor: '#62d75f',
      justifyContent: 'space-around', // Distribute children with equal spacing
      alignItems: 'center',
      paddingTop: 20, // Add padding at the top
      paddingBottom: 20, // Add padding at the bottom
    },
    angleContainer: {
      width: '80%', // Set width to 80% of its container
      alignItems: 'center',
      justifyContent: 'center',
      padding: 10,
      marginVertical: 10, // Add some vertical margin
      backgroundColor: '#f0f0f0', // Slightly grey background for the container
      borderRadius: 10, // Round the corners
      height:'20%'
    },
    angleText: {
      fontSize: 18,
      fontWeight: 'bold',
      marginVertical: 10,
      
    },
    pickerContainer: {
        overflow:'hidden',
        height:'20%',
      width: '80%', // Set width to 80% of its container
      alignItems: 'center',
      justifyContent: 'center',
    },
    picker: {
      width: '100%', // Set the picker to fill its container
    },
    lengthContainer: {
      width: '80%', // Set width to 80% of its container
      alignItems: 'center',
      justifyContent: 'center',
      padding: 10,
      marginTop: 20, // Add some top margin
      backgroundColor: '#f0f0f0', // Slightly grey background for the container
      borderRadius: 10, // Round the corners
    },
    lengthText: {
      fontSize: 20,
      color: 'green',
    },
    capturedAnglesContainer: {
      width: '80%', // Set width to 80% of its container
      alignItems: 'center',
      justifyContent: 'center',
      padding: 10,
      marginTop: 20, // Add some top margin
      backgroundColor: '#f0f0f0', // Slightly grey background for the container
      borderRadius: 10, // Round the corners
    },
    capturedAnglesText: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    redDot: {
      width: 10, // Size of the red dot
      height: 10, // Size of the red dot
      borderRadius: 5, // Half of the width/height to make it perfectly round
      backgroundColor: 'red',
    },
  });

export default Home;