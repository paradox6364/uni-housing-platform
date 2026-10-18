import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

// Replace localhost with your computer's local Wi-Fi IP address when testing on a physical phone
const API_BASE_URL = 'http://localhost:5000/api';

const FALLBACK_DATA = {
  university: { name: 'Cairo University', latitude: 30.0276, longitude: 31.2101 },
  listings: [
    {
      id: 'prop-1',
      title: 'Dokki Student Suites',
      distanceToUniKm: 1.23,
      startingPrice: 150,
      latitude: 30.0385,
      longitude: 31.2125,
      commute: { walkMinutes: 15 },
      images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80']
    },
    {
      id: 'prop-2',
      title: 'Bein El-Sarayat Campus Lofts',
      distanceToUniKm: 0.53,
      startingPrice: 210,
      latitude: 30.0312,
      longitude: 31.2065,
      commute: { walkMinutes: 7 },
      images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80']
    }
  ]
};

export default function App() {
  const [university, setUniversity] = useState(FALLBACK_DATA.university);
  const [listings, setListings] = useState(FALLBACK_DATA.listings);

  useEffect(() => {
    async function fetchFromBackend() {
      try {
        const uniRes = await fetch(`${API_BASE_URL}/universities`);
        const unis = await uniRes.json();
        if (unis.length > 0) {
          const searchRes = await fetch(`${API_BASE_URL}/listings/search?universityId=${unis[0].id}`);
          const data = await searchRes.json();
          setUniversity(data.university);
          setListings(data.listings);
        }
      } catch (e) {
        // Uses fallback data automatically if backend is offline
      }
    }
    fetchFromBackend();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>🎓 UniHousing Mobile</Text>
        <Text style={styles.sub}>Near {university.name}</Text>
      </View>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: university.latitude,
          longitude: university.longitude,
          latitudeDelta: 0.035,
          longitudeDelta: 0.035,
        }}
      >
        <Marker
          coordinate={{ latitude: university.latitude, longitude: university.longitude }}
          title={university.name}
          pinColor="red"
        />
        {listings.map((item) => (
          <Marker
            key={item.id}
            coordinate={{ latitude: item.latitude, longitude: item.longitude }}
            title={item.title}
            description={`From $${item.startingPrice}/mo`}
          />
        ))}
      </MapView>

      <View style={styles.sheet}>
        <Text style={styles.sheetTitle}>{listings.length} Verified Student Properties</Text>
        <FlatList
          data={listings}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.images?.[0] }} style={styles.cardImg} />
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.cardMeta}>
                  {item.distanceToUniKm} km • {item.commute?.walkMinutes || 12} min walk
                </Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.price}>${item.startingPrice}/mo</Text>
                  <TouchableOpacity style={styles.btn}>
                    <Text style={styles.btnText}>View</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 14, borderBottomWidth: 1, borderColor: '#e2e8f0' },
  brand: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
  sub: { fontSize: 12, color: '#2563eb', fontWeight: '600', marginTop: 2 },
  map: { flex: 1 },
  sheet: { height: 245, backgroundColor: '#f8fafc', paddingVertical: 12, paddingLeft: 14, borderTopWidth: 1, borderColor: '#e2e8f0' },
  sheetTitle: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 8 },
  card: { width: 250, backgroundColor: '#fff', borderRadius: 14, marginRight: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#e2e8f0' },
  cardImg: { width: '100%', height: 105 },
  cardBody: { padding: 10 },
  cardTitle: { fontWeight: '700', fontSize: 14, color: '#0f172a' },
  cardMeta: { fontSize: 11, color: '#64748b', marginTop: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  price: { fontSize: 16, fontWeight: '800', color: '#2563eb' },
  btn: { backgroundColor: '#2563eb', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
  btnText: { color: '#fff', fontSize: 11, fontWeight: '700' }
});
