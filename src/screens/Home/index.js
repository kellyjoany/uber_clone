import React, { useRef, useState, useEffect } from 'react';
import { StatusBar, SafeAreaView, Text, ActivityIndicator } from 'react-native';
import MapView from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import Geocoder from 'react-native-geocoding';
import { MapsApi } from '../../config';
import MapViewDirections from 'react-native-maps-directions';
import useUberApi from '../../useUberApi';
import AddressModal from '../../components/AddressModal';
import DriverModal from '../../components/DriverModal';

import {
    Container,
    MenuArea,
    MenuImage,
    IntineraryArea,
    IntineraryItem,
    IntineraryLabel,
    IntineraryPoint,
    IntineraryTitle,
    IntineraryValue,
    IntineraryPlaceHolder,
    RequestDetails,
    RequestDetail,
    RequestTitle,
    RequestValue,
    RequestButtons,
    RequestButton,
    RequestButtonText,
    LoadingArea
} from './styled';

const Page = (props) => {
    const map = useRef();
    const api = useUberApi();

    const [mapLoc, setMapLoc] = useState({
        center: {
            latitude: 37.78825,
            longitude: -122.4324
        },
        zoom: 16,
        pitch: 0,
        altitude: 0,
        heading: 0
    });

    const [fromLoc, setFromLoc] = useState({});
    const [toLoc, setToLoc] = useState({});
    const [showDirections, setShowDirections] = useState(false);
    const [requestDistance, setRequestDistance] = useState(0);
    const [requestTime, setRequestTime] = useState(0);
    const [requestPrice, setRequestPrice] = useState(0);

    const [modalTitle, setModalTitle] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalField, setModalField] = useState('');

    const [driverInfo, setDriverInfo] = useState({});
    const [driverModalVisible, setDriverModalVisible] = useState(false);

    const [loading, setLoading] = useState(false);

    useEffect(()=>{
        Geocoder.init(MapsApi, {language:'pt-br'});
        getMyCurrentPosition();
    }, []);

    useEffect(() => {
        if(fromLoc.center && toLoc.center) {
            setShowDirections(true);
        }
    }, [toLoc]);

    useEffect(() => {
        if(fromLoc.center) {
            setMapLoc(fromLoc);
        }
    }, [fromLoc]);

    const getMyCurrentPosition = () => {
        Geolocation.getCurrentPosition(async (info)=>{  
            const geo = await Geocoder.from(info.coords.latitude, info.coords.longitude);
            if(geo.results.length > 0) {
                const loc = {
                    name:geo.results[0].formatted_address,
                    center:{
                        latitude:info.coords.latitude,
                        longitude:info.coords.longitude
                    },
                    zoom:16,
                    pitch:0,
                    altitude:0,
                    heading:0
                };
                setMapLoc(loc);
                setFromLoc(loc);
            }
        }, (error)=>{
                console.log(error);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    }

    const handleFromClick = () => {
        setModalTitle('Escolha uma origem');
        setModalField('from');
        setModalVisible(true);
    }

    const handleToClick = async () => {
        setModalTitle('Escolha um destino');
        setModalField('to');
        setModalVisible(true);
        
        /*const geo = await Geocoder.from('Space Park Way, EUA');
        if(geo.results.length > 0) {
            const loc = {
                name:geo.results[0].formatted_address,
                center:{
                    latitude:geo.results[0].geometry.location.lat,
                    longitude:geo.results[0].geometry.location.lng
                },
                zoom:16,
                pitch:0,
                altitude:0,
                heading:0
            };

            setToLoc(loc);
        }*/
    }

    const handleDirectionsReady = async (r) => {
        setRequestDistance( r.distance );
        setRequestTime ( r.duration );

        const priceReq = await api.getRequestPrice( r.distance )
        if (!priceReq.error) {
            setRequestPrice( priceReq.price );
        }

        map.current.fitToCoordinates(r.coordinates, {
            edgePadding:{
                left: 50,
                right: 50,
                bottom: 50,
                top: 750
            }
        })
    }

    const handleRequestGo = async () => {
        setLoading(true);
        const driver = await api.findDriver({
            fromlat:fromLoc.center.latitude,
            fromlng:fromLoc.center.longitude,
            tolat:toLoc.center.latitude,
            tolng:toLoc.center.longitude
        });
        setLoading(false);

        if(!driver.error) {
            setDriverInfo(driver.driver);
            setDriverModalVisible(true);

            handleRequestCancel();
        } else {
            alert(driver.error);
        }
    }

    const handleRequestCancel = () => {
        setToLoc({});
        setShowDirections(false);
        setRequestDistance(0);
        setRequestTime(0);
        setRequestPrice(0);

        setMapLoc(fromLoc);
    }

    const handleMapChange = async () => {
        const cam = await map.current.getCamera();
        cam.altitude = 0;
        setMapLoc(cam);
    }

    const handleModalClick = (field, address) => {
        const loc = {
            name:address.address,
            center:{
                latitude:address.latitude,
                longitude:address.longitude
            },
            zoom:16,
            pitch:0,
            altitude:0,
            heading:0
        };

        switch(field) {
            case 'from':
                setFromLoc(loc);
                break;
            case 'to':
                setToLoc(loc);
                break;    
        }
    }

    const handleMenu = () => {
        props.navigation.openDrawer();
    }

    return (
        <Container>
            <StatusBar barStyle="dark-content" />
            <DriverModal 
                driver={driverInfo}
                visible={driverModalVisible}
                visibleAction={setDriverModalVisible}            
            />
            <AddressModal
                title={modalTitle}
                visible={modalVisible}
                visibleAction={setModalVisible}
                field={modalField}
                clickAction={handleModalClick}
            />
            <MapView
               ref={map}
               style={{flex:1}}
               provider="google"
               camera={mapLoc}
               onRegionChangeComplete={handleMapChange} 
            >
                {fromLoc.center &&
                    <MapView.Marker coordinate={fromLoc.center} />
                }
                {toLoc.center &&
                    <MapView.Marker coordinate={toLoc.center} />
                }
                {showDirections &&
                    <MapViewDirections 
                        origin={fromLoc.center}
                        destination={toLoc.center}
                        strokeWidth={5}
                        strokeColor="black"
                        apikey={MapsApi}
                        onReady={handleDirectionsReady}
                    />
                }
            </MapView>
            <MenuArea onPress={handleMenu} underlayColor="transparent">
                <MenuImage source={require('../../assets/menu.png')} />
            </MenuArea>
            <IntineraryArea>
                <IntineraryItem onPress={handleFromClick} underlayColor="#EEE">
                    <>
                        <IntineraryLabel>
                            <IntineraryPoint color="#0000FF" />
                            <IntineraryTitle>Origem</IntineraryTitle>
                        </IntineraryLabel>
                        {fromLoc.name &&
                            <IntineraryValue>{fromLoc.name}</IntineraryValue>
                        }
                        {!fromLoc.name &&
                            <IntineraryPlaceHolder>Escolha um local de origem</IntineraryPlaceHolder>
                        }
                    </>
                </IntineraryItem>
                <IntineraryItem onPress={handleToClick} underlayColor="#EEE">
                    <>
                        <IntineraryLabel>
                            <IntineraryPoint color="#00FF00" />
                            <IntineraryTitle>Destino</IntineraryTitle>
                        </IntineraryLabel>
                        {toLoc.name &&
                            <IntineraryValue>{toLoc.name}</IntineraryValue>
                        }
                        {!toLoc.name &&
                            <IntineraryPlaceHolder>Escolha um local de destino</IntineraryPlaceHolder>
                        }
                    </>
                </IntineraryItem>
                {fromLoc.center && toLoc.center &&
                    <IntineraryItem>
                        <>
                            <RequestDetails>
                                <RequestDetail>
                                    <RequestTitle>Distância</RequestTitle>
                                    <RequestValue>{requestDistance > 0 ? `${requestDistance.toFixed(1)}km` : '--'}</RequestValue>
                                </RequestDetail>
                                <RequestDetail>
                                    <RequestTitle>Tempo</RequestTitle>
                                    <RequestValue>{requestTime > 0 ? `${requestTime.toFixed(0)}mins` : '--'}</RequestValue>
                                </RequestDetail>
                                <RequestDetail>
                                    <RequestTitle>Preço</RequestTitle>
                                    <RequestValue>{requestPrice > 0 ? `R$ ${requestPrice.toFixed(2)}` : '--'}</RequestValue>
                                </RequestDetail>
                            </RequestDetails>
                            <RequestButtons>
                                <RequestButton color="#0000FF" onPress={handleRequestGo}>
                                    <RequestButtonText>Solicitar Motorista</RequestButtonText>
                                </RequestButton>
                                <RequestButton color="#FF0000" onPress={handleRequestCancel}>
                                    <RequestButtonText>Cancelar</RequestButtonText>
                                </RequestButton>
                            </RequestButtons>
                        </>
                    </IntineraryItem>
                }
            </IntineraryArea>
            {loading &&
                <LoadingArea>
                    <ActivityIndicator size="large" color="#FFF" />
                </LoadingArea>
            }
        </Container>
    );
}

export default Page;