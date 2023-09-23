import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import MapView, {
  Callout,
  Circle,
  Marker,
  PROVIDER_GOOGLE,
  Polygon,
  Polyline,
} from 'react-native-maps';
import {GOOGLE_MAPS_API_KEY} from '../../config/constants';
import MapViewDirections from 'react-native-maps-directions';
import * as geolib from 'geolib';
import Geolocation from '@react-native-community/geolocation';
import GetLocation from 'react-native-get-location';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
});

let myPloygon = [
  {
    latitude: 24.782303,
    longitude: 67.062179,
  },
  {
    latitude: 24.780324,
    longitude: 67.064671,
  },
  {
    latitude: 24.777024,
    longitude: 67.061591,
  },
  {
    latitude: 24.77913,
    longitude: 67.059134,
  },
];

export default function GoogleMapsScreen() {
  const mapRef = useRef(null);
  const [origin, setOrigin] = useState();
  const [destination, setDestination] = useState();
  const [marker, setMarker] = useState();
  const [permissionGranter, setPermissionGranter] = useState(false);
  const [markersList, setMarkersList] = useState([
    {
      id: 1,
      latitude: 24.794446,
      longitude: 67.057423,
      title: 'Team A',
      description: 'This is Team A current location',
    },
    {
      id: 2,
      latitude: 24.833368,
      longitude: 67.048489,
      title: 'Team B',
      description: 'This is Team B current location',
    },
  ]);

  useEffect(() => {
    _getLocationPermission();
  }, []);

  async function _getLocationPermission() {
    Geolocation.setRNConfiguration({
      authorizationLevel: 'always',
      authorizationLevel: 'always',
    });

    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Please Allow Location permission to continue..',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setPermissionGranter(true);
          _getCurrentLocation();
        } else {
          console.log('Location permission denied');
        }
      } catch (err) {
        console.warn(err);
      }
    } else if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization(
        () => {
          console.log('success');
          _getCurrentLocation();
        },
        () => {
          console.log('error');
        },
      );
    }
  }

  function _getCurrentLocation() {
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 60000,
    })
      .then(location => {
        console.log('My Current Location is => ', location);
      })
      .catch(error => {
        const {code, message} = error;
        console.warn(code, message);
      });
  }

  const MyCustomMarkerView = () => {
    return (
      <Image
        style={{
          width: 30,
          height: 30,
        }}
        source={require('../../assets/car.png')}
      />
    );
  };

  const MyCustomCalloutView = () => {
    return (
      <View
        style={{
          width: 150,
        }}>
        <Text>MyCustomCalloutView</Text>
      </View>
    );
  };

  async function moveToLocation(latitude, longitude) {
    mapRef.current.animateToRegion(
      {
        latitude,
        longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      },
      2000,
    );
  }

  function _locationLieInsidePolygon(coordinates) {
    let bol = geolib.isPointInPolygon(coordinates, myPloygon);
    console.log('_locationLieInsidePolygon=>', bol);

    let msg = '';
    if (bol) {
      msg = 'coordinates exist inside polygon';
    } else {
      msg = 'coordinates exist outside polygon';
    }

    Alert.alert('Geo fencing', msg, [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
  }

  if (!permissionGranter)
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Please Allow Location permission to continue..</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <View
        style={{
          zIndex: 1,
          flex: 0.3,
          flexDirection: 'row',
          marginHorizontal: 10,
          marginVertical: 5,
        }}>
        <View style={{flex: 0.5}}>
          <GooglePlacesAutocomplete
            fetchDetails={true}
            placeholder="Origin"
            onPress={(data, details = null) => {
              let originCordinates = {
                latitude: details?.geometry?.location.lat,
                longitude: details?.geometry?.location.lng,
              };
              setOrigin(originCordinates);
              moveToLocation(originCordinates);
            }}
            query={{
              key: GOOGLE_MAPS_API_KEY,
              language: 'en',
            }}
            onFail={error => console.log(error)}
          />
        </View>
        <View style={{flex: 0.5, marginLeft: 6}}>
          <GooglePlacesAutocomplete
            fetchDetails={true}
            placeholder="destination"
            onPress={(data, details = null) => {
              let destinationCordinates = {
                latitude: details?.geometry?.location.lat,
                longitude: details?.geometry?.location.lng,
              };
              setDestination(destinationCordinates);
              moveToLocation(destinationCordinates);
            }}
            query={{
              key: GOOGLE_MAPS_API_KEY,
              language: 'en',
            }}
            onFail={error => console.log(error)}
          />
        </View>
      </View>
      <MapView
        ref={mapRef}
        onPress={e => {
          console.log(e.nativeEvent.coordinate);
          setMarker(e.nativeEvent.coordinate);
          _locationLieInsidePolygon(e.nativeEvent.coordinate);
        }}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={{
          latitude: 24.842865,
          longitude: 67.044405,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}>
        {marker !== undefined ? <Marker coordinate={marker}></Marker> : null}
        {origin !== undefined ? <Marker coordinate={origin}></Marker> : null}
        {destination !== undefined ? (
          <Marker coordinate={destination}></Marker>
        ) : null}
        <Marker
          coordinate={{
            latitude: 24.759833,
            longitude: 67.079526,
          }}>
          <MyCustomMarkerView />
          <Callout style={{width: 300, height: 100}}>
            <MyCustomCalloutView />
          </Callout>
        </Marker>
        {markersList.map(marker => {
          return (
            <Marker
              draggable
              key={marker.id}
              coordinate={{
                latitude: marker.latitude,
                longitude: marker.longitude,
              }}
              title={marker.title}
              description={marker.description}
              onDragEnd={e => console.log({x: e.nativeEvent.coordinate})}
            />
          );
        })}

        <Circle
          center={{
            latitude: 24.769263,
            longitude: 67.066263,
          }}
          radius={200}
          strokeColor="blue"
          fillColor="#EBF5FB"
        />
        <Polyline
          strokeColor="red"
          strokeWidth={2}
          coordinates={[
            {
              latitude: 24.780292,
              longitude: 67.064913,
            },
            {
              latitude: 24.771274,
              longitude: 67.076091,
            },
          ]}
        />
        <Polygon
          strokeColor="red"
          fillColor="#EBF5FB"
          strokeWidth={2}
          coordinates={myPloygon}
        />
        {origin != undefined && destination != undefined ? (
          <MapViewDirections
            origin={origin}
            strokeColor="blue"
            strokeWidth={2}
            destination={destination}
            apikey={GOOGLE_MAPS_API_KEY}
          />
        ) : null}
      </MapView>
    </View>
  );
}
