import { StatusBar } from 'expo-status-bar';
import React,{ useState, useEffect} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import * as Location from 'expo-location'




export default function App() {
  const [isFetching, setIsFetching] = useState(false)
  const [location, setLocation] = useState(null)
  const [pickedLocation, setPickedLocation] = useState()
  const [place, setPlace] = useState(null)


  // useEffect para manejar los permisos al comienzo de la aplicación
  useEffect(() => {
    (async ()=> {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if(status !== 'granted'){
        Alert.alert(
          'Permisos insuficientes',
          'Necesita dar permisos de localización para la App',
          [{ text:'Ok' }]
        );
        return;
      }
      setLocation(true)
    })();
  }, [])
      
      

  // event handler para manejar el boton al momento de presionar y obtener latitud y longitud, se llena con esos datos el state picked location
  const getLocationHandler = async () => {
    if(!location) return;
    console.log(location);
    try {
        setIsFetching(true);
        const location = await Location.getCurrentPositionAsync({
          timeout:5000
        });
        
        setPickedLocation({
          lat:location.coords.latitude,
          lng:location.coords.longitude
        });

    } catch (error) {
      Alert.alert(
        'No se pudo obtener la localización',
        'Por favor intente nuevamente',
        [{text:'Ok'}]
      );
    }
    setIsFetching(false)

  }


  // una vez obtenida la latitud y longitud, se activa el useeffect para realizar la consulta a la API de datos del gobierno argentino y obtener la pronvicia y la ciudad donde se encuentra el movil. * si se trata de CABA, solo devuelve provincia, no asi ciudad. * si la localizacion se encuentra fuera de argentina, devuelve null ambos datos.
  useEffect(() => {
    if(!pickedLocation) return;
    (async ()=>{
      const response = await fetch(`https://apis.datos.gob.ar/georef/api/ubicacion?lat=${pickedLocation.lat}&lon=${pickedLocation.lng}`);
      const data = await response.json();
      
      setPlace({
        province:data.ubicacion.provincia.nombre ? data.ubicacion.provincia.nombre : "No se localizó.",
        city: data.ubicacion.municipio.nombre ? data.ubicacion.municipio.nombre : "No se localizó."
      })
    })();
  }, [pickedLocation])

  


  
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={getLocationHandler}>
        <Text style={styles.buttonText}>Obtener mi ubicación</Text>
      </TouchableOpacity>
      {isFetching && <Text style={styles.fetching}>Buscando localización..</Text>}
      {place && 
        <View style={styles.place}>
          <Text style={styles.placeData}>Provincia: {place.province}</Text>
          <Text style={styles.placeData}>Ciudad: {place.city}</Text>
        </View>
      }

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button:{
    backgroundColor:"#40bf80",
    padding:15,
    borderRadius:10
  },
  buttonText:{
    color:"#FFFFFF",
    fontSize:20
  },
  place:{
    paddingTop:100,
  },
  placeData:{
    fontSize:20,
    padding:15
  },
  fetching:{
    paddingTop:20
  }
});
