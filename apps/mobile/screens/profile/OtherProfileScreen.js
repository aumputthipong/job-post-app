import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  ImageBackground,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useSelector } from "react-redux";
import {
  useNavigation,
  useIsFocused,
  useFocusEffect,
} from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import FontAwesome from "react-native-vector-icons/FontAwesome";
const OtherProfileScreen = ({ route, navigation }) => {
  const peopleid = route.params.id;
  const availableUser = useSelector((state) => state.users.users);
  const displayedUser = availableUser.find((job) => job.id == peopleid);
  console.log(displayedUser);
  return (
    <ScrollView style={styles.screen}>
      <View style={{ ...styles.item, ...{ marginTop: 95 } }}>
        <Image
          style={styles.profileImg}
          source={{
            uri:
              displayedUser.imageUrl ||
              "https://firebasestorage.googleapis.com/v0/b/log-in-d8f2c.appspot.com/o/profiles%2FprofilePlaceHolder.jpg?alt=media&token=35a4911f-5c6e-4604-8031-f38cc31343a1&_gl=1*51075c*_ga*ODI1Nzg1MDQ3LjE2NjI5N6JhaZ1Yx5r1r15r1h&_ga_CW55HF8NVT*MTY5ODA2NzU0NC4yNy4xLjE2OTgwNjgyMjEuMTcuMC4w",
          }}
        ></Image>
        <Text style={{ ...styles.jobTitle, ...{ fontSize: 25 } }}>
          {displayedUser.firstName} {displayedUser.lastName}
        </Text>
        <Text style={styles.subTitle}>{displayedUser.job}</Text>
      </View>
      <View
        style={{
          ...styles.item,
          ...{ marginTop: 25, alignItems: "flex-start", height: 450 },
        }}
      >
        <Text style={{ ...styles.jobTitle, ...{ fontSize: 25 ,fontWeight:"600"  } }}>
          About Me
        </Text>
        <Text style={{ ...styles.subTitle, ...{ fontSize: 15 } }}>
          {displayedUser.aboutme}
        </Text>

        <Text style={{ ...styles.jobTitle, ...{ fontSize: 25 ,fontWeight:"600"  } }}>ช่องทางติดต่อ</Text>
        <View style={{ ...styles.postRow, ...{} }}>
          <Text style={styles.subTitle}>
            <FontAwesome5 name={"user"} size={20} /> Email :
          </Text>
          <Text style={{ ...styles.subTitle, ...{ fontWeight: "normal" } }}>
            {displayedUser.email}
          </Text>
        </View>
        {/* เบอร์ */}
        <View style={styles.postRow}>
          <Text style={styles.subTitle}>
            <FontAwesome5 name={"phone"} size={20} /> Phone :
          </Text>
          <Text style={{ ...styles.subTitle, ...{ fontWeight: "normal" } }}>
            {displayedUser.phone}
          </Text>
        </View>
        {/* line */}
        <View style={styles.postRow}>
          <Text style={styles.subTitle}>
            <FontAwesome5 name={"line"} size={22} /> Line :
          </Text>
          <Text style={{ ...styles.subTitle, ...{ fontWeight: "normal" } }}>
            {displayedUser.line}
          </Text>
        </View>
        {/* facebook */}
        <View style={styles.postRow}>
          <Text style={styles.subTitle}>
            <FontAwesome5 name={"facebook"} size={20} /> Facebook :
          </Text>
          <Text style={{ ...styles.subTitle, ...{ fontWeight: "normal" } }}>
            {displayedUser.facebook}
          </Text>
        </View>
      </View>
      <View
        style={{
          ...styles.item,
          ...{ marginTop: 25, alignItems: "flex-start", height: 450 },
        }}
      >

        <Text style={{ ...styles.jobTitle, ...{ fontSize: 25 ,fontWeight:"600" } }}>การศึกษา</Text>
        
          <Text style={{...styles.subTitle,...{fontWeight: "500" }}}>
            ปริญญาตรี : <Text style={{ ...styles.subTitle, ...{ fontWeight: "normal" } }}>{displayedUser.email}</Text>
          </Text>
          
     
        {/* โท*/}
        
          <Text style={{...styles.subTitle,...{fontWeight: "500" }}}>
             ปริญญาโท : <Text style={{ ...styles.subTitle, ...{ fontWeight: "normal" } }}>{displayedUser.master}</Text>
          </Text>
          
      
        {/* เอก */}
        
          <Text style={{...styles.subTitle,...{fontWeight: "500" }}}>
            ปริญญาเอก : <Text style={{ ...styles.subTitle, ...{ fontWeight: "normal" } }}>{displayedUser.doctoral}</Text>
          </Text>
          
 
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#BEBDFF",
  },
  jobTitle: {
    marginTop: 20,
    marginLeft: 15,
    fontSize: 30,
    fontWeight: "500",
    textAlign: "left",
    color: "black",
  },
  item: {
    backgroundColor: "white",
    width: "95%",
    height: 250,
    marginVertical: "2%",
    borderRadius: 10,
    alignSelf: "center",
    paddingBottom: "20%",
    alignItems: "center",

    // padding: 20
  },
  title: {
    marginTop: 20,
    marginLeft: 15,
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "left",
    color: "#4B32E5",
  },
  subTitle: {
    marginTop: 10,
    fontSize: 18,
    marginLeft: 10,
    fontWeight: "400",
    // backgroundColor:"red"
  },
  subText: {
    fontSize: 18,
    marginHorizontal: 20,
    // backgroundColor:"blue"
    fontWeight: "normal",
  },
  detailText: {
    fontSize: 11,
    color: "#929090",
    marginHorizontal: 10,
  },
  bgImage: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
    resizeMode: "stretch",
    borderTopEndRadius: 20,
    borderTopStartRadius: 20,
  },
  postRow: {
    flexDirection: "row",
    // backgroundColor:"red",
  },
  postHeader: {
    borderTopEndRadius: 20,
    borderTopStartRadius: 20,
    height: 200,
  },
  input: {
    width: 250,
    textAlign: "center",
    height: 30,
    borderBottomColor: "grey",
    borderBottomWidth: 1,
    marginVertical: 10,
    alignSelf: "center",
    textAlign: "left",
    marginLeft: 15,
  },
  profileImg: {
    marginTop: -50,
    marginLeft: 10,
    width: 150,
    height: 150,
    borderRadius: 360,
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
  editbutton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "#5A6BF5",
    width: 55,
    height: 55,
    borderRadius: 30,
    padding: "2.5%",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
});

export default OtherProfileScreen;
