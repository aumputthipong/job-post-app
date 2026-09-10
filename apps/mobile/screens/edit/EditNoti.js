import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  FlatList,
  ScrollView
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import firebase from "../../database/firebaseDB";
import { SelectList } from "react-native-dropdown-select-list";
import { MultipleSelectList } from 'react-native-dropdown-select-list'
import { useSelector } from "react-redux";
import { filterJobs } from "../../store/actions/jobAction";
import { useDispatch } from "react-redux";


const EditNoti = ({ navigation }) => {
  const dispatch = useDispatch();
  const userId = firebase.auth().currentUser.uid;


  // const myNoti = currentNoti.filter((noti) => noti.notiBy == userId);

  const [selected, setSelected] = useState([]);
  // const noti = useSelector((state) => state.jobs.favoriteJobs);

  // const myNoti = noti.filter((noti)=> noti.notiBy == userId);

  const applyFilters = () => {
    // ส่งค่า filter ไปยัง Redux state
    dispatch(filterJobs(selected));
    console.log(selected)
    
    navigation.navigate("NotificationScreen") // กลับไปหน้า NotificationScreen
  };
  
  const categorydata = [
    { key: "1", value: "งานบัญชี" },
    { key: "2", value: "งานทรัพยากรบุคคล" },
    { key: "3", value: "งานธนาคาร" },
    { key: "4", value: "งานสุขภาพ" },
    { key: "5", value: "งานก่อสร้าง" },
    { key: "6", value: "งานออกแบบ" },
    { key: "7", value: "งานไอที" },
    { key: "8", value: "งานการศึกษา" },
    { key: "9", value: "งานอาหาร" },
    { key: "10", value: "งานธรรมชาติ" },
    { key: "12", value: "งานทั่วไป" },
    { key: "12", value: "อื่นๆ" },
  ];


  return (
    <View style={{...styles.container,...{paddingVertical:10}}}>
        <Text style={{...styles.title,...{fontSize:20,marginVertical:10}}} numberOfLines={2}>
        ประเภท
        </Text>
      <MultipleSelectList
      style={{paddingHorizontal:20}}
        setSelected={(val) => setSelected(val)}
        data={categorydata}
        save="value"
        placeholder="เลือกประเภท"
        label="Categories"
      />


      <TouchableOpacity style={{...styles.button,...{marginTop:10}}} onPress={applyFilters}>
        <Text style={{ ...{ color: "white" } }}>บันทึก</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: "10%",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  input: {
    width: "85%",
    paddingHorizontal: 10,
    height: 40,
    borderBottomColor: "grey",
    borderBottomWidth: 1,
    marginVertical: 10,
    alignSelf: "center",
    textAlign: "left",
    marginLeft: 15,
    backgroundColor: "white",
  },
  text: {
    textAlign: "left",
    fontSize: 15,
  },
  button: { 
    backgroundColor: "#5A6BF5",
    width:"50%",
    height: 40,
    borderRadius:10,
    padding:"2.5%",
    alignItems: "center",
    alignSelf:"center",
    marginTop: 10
  },
  postRow: {
    flexDirection: "row",
    // backgroundColor:"red",
  },
  postImage: {
    width: 250,
    height: 180,
    justifyContent: "flex-end",
    resizeMode: "stretch",
  },
  button: {
    backgroundColor: "#5A6BF5",
    width: "50%",
    height: 40,
    borderRadius: 10,
    padding: "2.5%",
    alignItems: "center",
    alignSelf: "center",
  },
});

export default EditNoti;
