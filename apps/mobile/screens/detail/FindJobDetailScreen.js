import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import firebase from "../../database/firebaseDB";
import * as ImagePicker from "expo-image-picker";
import { Rating } from "react-native-ratings";
import { scoreRating } from "../../store/actions/jobAction";

const FindJobDetailScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const jobid = route.params.id;
  const currentUserId = firebase.auth().currentUser?.uid;

  // --- State ---
  const [ratingPost, setRatingPost] = useState(0);
  const [maxRating, setMax] = useState(" รีวิว");
  const [yourRating, setYourRating] = useState(0);
  const [commentBox, setCommentBox] = useState("");
  const [uploading, setUploading] = useState(false);

  // --- Redux Data ---
  const availableJob = useSelector((state) => state.jobs.filteredJobs || []);
  const availableUser = useSelector((state) => state.users.users || []);
  const availableComment = useSelector((state) => state.jobs.comments || []);
  const availableRating = useSelector((state) => state.jobs.ratingJobs || []);

  // หาข้อมูลงาน (ใช้การป้องกัน undefined)
  const displayedJob = availableJob.find((job) => job?.id == jobid);

  // หาข้อมูล User ปัจจุบัน
  const currentUserImg = availableUser.find(
    (user) => user?.id == currentUserId,
  );

  // จัดการคอมเมนต์ (ใส่ ? ป้องกันแครช)
  const thisPostComment = availableComment.filter((c) => c?.postId == jobid);
  const thisFliteredPostComment = thisPostComment.map((comment) => {
    const user = availableUser.find((u) => u?.id === comment?.userId);
    return {
      ...comment,
      userImage: user?.imageUrl,
      userfistName: user?.firstName || "ผู้ใช้งาน",
      userlastName: user?.lastName || "",
    };
  });

  // จัดการเรตติ้ง
  const thisAllPostRating = availableRating.filter((r) => r?.postId === jobid);

  useEffect(() => {
    if (thisAllPostRating.length > 0) {
      const totalRating = thisAllPostRating.reduce(
        (acc, rating) => acc + rating.rating,
        0,
      );
      const averageRating = totalRating / thisAllPostRating.length;
      setRatingPost(parseFloat(averageRating.toFixed(2)));
      setMax("/5 คะแนน");

      const userRating = thisAllPostRating.find(
        (r) => r.userId === currentUserId,
      );
      setYourRating(userRating ? userRating.rating : 0);
    } else {
      setRatingPost(0);
      setMax(" รีวิว");
      setYourRating(0);
    }
  }, [availableRating, jobid, currentUserId]);

  // --- Functions ---
  const sentComment = () => {
    if (commentBox.trim() !== "") {
      firebase
        .firestore()
        .collection("JobComments")
        .add({
          postId: jobid,
          userId: currentUserId,
          comment: commentBox.trim(),
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        })
        .then(() => setCommentBox(""))
        .catch((error) => console.error("Error adding comment: ", error));
    }
  };

  const ratingCompleted = (rating) => {
    dispatch(scoreRating(jobid, rating));
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("แจ้งเตือน", "กรุณาอนุญาตให้แอปเข้าถึงคลังรูปภาพ");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setUploading(true);
      await editImg(result.assets[0].uri);
    }
  };

  const editImg = async (uri) => {
    try {
      let filename = uri.substring(uri.lastIndexOf("/") + 1);
      const response = await fetch(uri);
      const blob = await response.blob();
      const uploadTask = firebase
        .storage()
        .ref()
        .child(`images/${filename}`)
        .put(blob);

      uploadTask.on(
        "state_changed",
        null,
        (error) => {
          console.error("Upload Error: ", error);
          setUploading(false);
          Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถอัปโหลดรูปภาพได้");
        },
        async () => {
          const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
          await firebase
            .firestore()
            .collection("JobPosts")
            .doc(jobid)
            .update({ imageUrl: downloadURL });
          setUploading(false);
          Alert.alert("สำเร็จ", "อัปเดตรูปภาพเรียบร้อยแล้ว");
        },
      );
    } catch (e) {
      console.log(e);
      setUploading(false);
    }
  };

  // ------------------------------------------------------------------
  // UI FALLBACK (ถ้ารอข้อมูลอยู่ หรือหาข้อมูลไม่เจอ ให้แสดงหน้านี้ก่อนเพื่อไม่ให้แอปพัง)
  // ------------------------------------------------------------------
  if (!displayedJob) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#083C6B" />
        <Text style={{ marginTop: 10, color: "#666" }}>กำลังโหลดข้อมูล...</Text>
      </View>
    );
  }

  // ------------------------------------------------------------------
  // MAIN RENDER
  // ------------------------------------------------------------------
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Cover Image Section */}
        <View style={styles.headerImageContainer}>
          <Image
            source={{ uri: displayedJob.imageUrl }}
            style={styles.headerImage}
          />

          {/* ปุ่มแก้ไขลอยอยู่บนรูปภาพสำหรับเจ้าของโพสต์ */}
          {currentUserId === displayedJob.postById && (
            <TouchableOpacity
              style={styles.editImageBtn}
              onPress={pickImage}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="camera" size={20} color="white" />
                  <Text style={styles.editImageText}>เปลี่ยนรูป</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.contentContainer}>
          {/* Header Title & Rating */}
          <Text style={styles.jobTitleText}>{displayedJob.jobTitle}</Text>
          <Text style={styles.agencyText}>{displayedJob.agency}</Text>
          <View style={styles.ratingRow}>
            <Rating
              readonly
              startingValue={ratingPost}
              imageSize={18}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.ratingText}>
              {ratingPost} {maxRating} ({thisAllPostRating.length} รีวิว)
            </Text>
          </View>
          <View style={styles.divider} />
          {/* Job Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>รายละเอียดงาน</Text>
            <View style={styles.detailRow}>
              <Ionicons name="briefcase-outline" size={20} color="#083C6B" />
              <Text style={styles.detailText}>
                <Text style={styles.bold}>ตำแหน่ง: </Text>
                {displayedJob.position}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="cash-outline" size={20} color="#083C6B" />
              <Text style={styles.detailText}>
                <Text style={styles.bold}>ค่าจ้าง: </Text>
                {displayedJob.wage} บาท / {displayedJob.employmentType}
              </Text>
            </View>
            <Text style={styles.descriptionText}>{displayedJob.detail}</Text>
          </View>
          {/* Attributes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>คุณสมบัติ</Text>
            {displayedJob.attributes?.map((attr, index) => (
              <View key={index} style={styles.bulletRow}>
                <View style={styles.bulletPoint} />
                <Text style={styles.bulletText}>{attr}</Text>
              </View>
            ))}
          </View>
          {/* Welfare */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>สวัสดิการ</Text>
            {displayedJob.welfareBenefits?.map((wel, index) => (
              <View key={index} style={styles.bulletRow}>
                <View style={styles.bulletPoint} />
                <Text style={styles.bulletText}>{wel}</Text>
              </View>
            ))}
          </View>
          {/* Contact */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ช่องทางติดต่อ</Text>
            <View style={styles.contactRow}>
              <MaterialCommunityIcons
                name="email-outline"
                size={22}
                color="#666"
              />
              <Text style={styles.contactText}>
                {displayedJob.email || "ไม่ระบุ"}
              </Text>
            </View>
            <View style={styles.contactRow}>
              <MaterialCommunityIcons
                name="phone-outline"
                size={22}
                color="#666"
              />
              <Text style={styles.contactText}>
                {displayedJob.phone || "ไม่ระบุ"}
              </Text>
            </View>
          </View>
          {/* Rating Box (สำหรับคนที่ไม่ใช่เจ้าของโพสต์) */}
          {currentUserId !== displayedJob.postById && (
            <View style={styles.ratingBox}>
              <Text style={styles.ratingBoxTitle}>ให้คะแนนโพสต์นี้</Text>
              <Rating
              tintColor="#e9e9e9"
                showRating={false}
                onFinishRating={ratingCompleted}
                imageSize={32}
                startingValue={yourRating}
              />
            </View>
          )}
          <View style={styles.divider} />
          {/* Comments Section */}
          <Text style={styles.commentHeader}>
            ความคิดเห็น ({thisFliteredPostComment.length})
          </Text>
          <View style={styles.commentInputRow}>
            <Image
              source={{
                uri:
                  currentUserImg?.imageUrl ||
                  "https://ui-avatars.com/api/?name=U&background=E4E9F2&color=666",
              }}
              style={styles.commentAvatar}
            />
            <TextInput
              style={styles.commentInput}
              placeholder="แสดงความคิดเห็น..."
              value={commentBox}
              onChangeText={setCommentBox}
              maxLength={100}
            />
            <TouchableOpacity style={styles.sendButton} onPress={sentComment}>
              <MaterialCommunityIcons name="send" size={22} color="white" />
            </TouchableOpacity>
          </View>
          {thisFliteredPostComment.map((comment, index) => (
            <View key={index} style={styles.commentItem}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("OtherProfile", { id: comment.userId })
                }
              >
                <Image
                  source={{
                    uri:
                      comment.userImage ||
                      `https://ui-avatars.com/api/?name=${comment.userfistName}&background=083C6B&color=fff`,
                  }}
                  style={styles.commentAvatar}
                />
              </TouchableOpacity>
              <View style={styles.commentContent}>
                <Text style={styles.commentName}>
                  {comment.userfistName} {comment.userlastName}
                </Text>
                <Text style={styles.commentText}>{comment.comment}</Text>
              </View>
            </View>
          ))}
          <View style={{ height: 40 }} /> 
        </View>
      </ScrollView>

      {/* Edit Post Button (FAB) */}
      {currentUserId === displayedJob.postById && (
        <TouchableOpacity
          style={styles.fabEdit}
          onPress={() =>
            navigation.navigate("EditFind", { id: displayedJob.id })
          }
        >
          <MaterialCommunityIcons name="pencil" size={24} color="white" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F7FA" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1 },
  headerImageContainer: {
    width: "100%",
    height: 220,
    backgroundColor: "#E4E9F2",
  },
  headerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  editImageBtn: {
    position: "absolute",
    bottom: 15,
    right: 15,
    backgroundColor: "rgba(0,0,0,0.6)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editImageText: {
    color: "white",
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "600",
  },
  contentContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  jobTitleText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#083C6B",
    marginBottom: 4,
  },
  agencyText: { fontSize: 16, color: "#64748B", marginBottom: 12 },
  ratingRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  ratingText: { fontSize: 14, color: "#666" },
  divider: { height: 1, backgroundColor: "#E4E9F2", marginVertical: 20 },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  detailText: { fontSize: 15, color: "#4A5568", marginLeft: 10 },
  bold: { fontWeight: "bold", color: "#333" },
  descriptionText: {
    fontSize: 15,
    color: "#4A5568",
    lineHeight: 24,
    marginTop: 8,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
    paddingRight: 10,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#083C6B",
    marginTop: 8,
    marginRight: 10,
  },
  bulletText: { fontSize: 15, color: "#4A5568", flex: 1, lineHeight: 22 },
  contactRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  contactText: { fontSize: 15, color: "#333", marginLeft: 10 },
  ratingBox: {
    backgroundColor: "#e9e9e9",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E4E9F2",
  },
  ratingBoxTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  commentHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E4E9F2",
    marginRight: 12,
  },
  commentInput: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E4E9F2",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#083C6B",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  commentItem: { flexDirection: "row", marginBottom: 16 },
  commentContent: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: 12,
    borderRadius: 12,
    borderTopLeftRadius: 4,
  },
  commentName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  commentText: { fontSize: 14, color: "#4A5568", lineHeight: 20 },
  fabEdit: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "#083C6B",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});

export default FindJobDetailScreen;
