import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import firebase from "../../database/firebaseDB";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Modal from "react-native-modal";
import ImageViewer from "react-native-image-zoom-viewer";
import * as ImagePicker from "expo-image-picker";
import { hireRating } from "../../store/actions/hireAction";
import { Rating, AirbnbRating } from "react-native-ratings";
import { Ionicons } from "@expo/vector-icons";
const HireJobDetailScreen = ({ route, navigation }) => {
  const [ratingPost, setRatingPost] = useState(null);
  const [maxRating, setMax] = useState(null);
  const [yourRating, setYourRating] = useState(null);
  const hireid = route.params.id;
  const availableHire = useSelector((state) => state.hires.filteredHires);
  const displayedHire = availableHire.find((hire) => hire.id == hireid);
  const displayedUsers = useSelector((state) => state.users.users);
  const currentUserId = firebase.auth().currentUser.uid;
  const postOwner = displayedUsers.find(
    (user) => user.id == displayedHire.postById,
  );

  const [commentBox, setCommentBox] = useState("");
  const availableUser = useSelector((state) => state.users.users);
  const availableComment = useSelector((state) => state.hires.comments);
  const thisPostComment = availableComment.filter(
    (comment) => comment.postId == hireid,
  );
  const thisFliteredPostComment = thisPostComment.map((comment) => {
    const user = availableUser.find((user) => user.id === comment.userId);
    return {
      ...comment,
      userId: user.id,
      userImage: user.imageUrl,
      userfistName: user.firstName,
      userlastName: user.lastName,
    };
  });
  const currentUserImg = availableUser.find((user) => user.id == currentUserId);
  const sentComment = () => {
    if (commentBox.trim() !== "") {
      // ล้าง TextInput
      firebase
        .firestore()
        .collection("HireComments")
        .add({
          postId: hireid,
          userId: currentUserId,
          comment: commentBox,
        })
        .then(() => {
          console.log("Job added to comment on Firebase");
        })
        .catch((error) => {
          console.error("Error adding job to favorites: ", error);
        });
      setCommentBox("");
    }
  };
  console.log(hireid);

  const [uploading, setUploading] = useState(false);
  const [image, setImage] = useState(null);
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please allow access to your media library to pick an image.",
      );
    } else {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [210, 297],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        editImg(result.assets[0].uri);
      }
    }
  };

  const editImg = async () => {
    if (image) {
      let filename = image.substring(image.lastIndexOf("/") + 1);

      try {
        const response = await fetch(image);
        const blob = await response.blob();
        const uploadTask = firebase
          .storage()
          .ref()
          .child(`images/${filename}`)
          .put(blob);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload is ${progress}% done`);
          },
          (error) => {
            console.error("Upload Error: ", error);
          },
          () => {
            uploadTask.snapshot.ref
              .getDownloadURL()
              .then(async (downloadURL) => {
                const img = {
                  resumeUrl: downloadURL,
                };
                const postRef = firebase
                  .firestore()
                  .collection("HirePosts")
                  .doc(hireid);
                await postRef
                  .update(img)
                  .then(() => {
                    console.log("อัพเดทข้อมูลสำเร็จ");
                    // getUserData();
                  })
                  .catch((error) => {
                    console.error("เกิดข้อผิดพลาดในการอัพเดทข้อมูล:", error);
                  });
              });
          },
        );
      } catch (e) {
        console.log(e);
      }
    } else {
      console.log("No image to upload");
    }
  };

  const [isModalVisible, setModalVisible] = useState(false);
  const images = [
    {
      url: displayedHire.resumeUrl,
    },
    // เพิ่มรูปภาพเพิ่มเติมในอาร์เรย์ตามต้องการ
  ];

  const dispatch = useDispatch();

  const availableRating = useSelector((state) => state.hires.ratingJobs);
  console.log(hireid);
  const thisAllPostRating = availableRating.filter(
    (rating) => rating.postId === hireid,
  );
  console.log(thisAllPostRating);
  useEffect(() => {
    const thisPostRating = availableRating.filter(
      (rating) => rating.postId === hireid,
    );

    if (thisPostRating.length > 0) {
      const totalRating = thisPostRating.reduce(
        (acc, rating) => acc + rating.rating,
        0,
      );
      const averageRating = totalRating / thisPostRating.length;
      const isInteger = averageRating % 1 === 0;

      if (isInteger) {
        setRatingPost(averageRating.toString()); // ไม่มีทศนิยมถ้าเป็นจำนวนเต็ม
      } else {
        setRatingPost(averageRating.toFixed(2));
      }
      setMax("/5 คะแนน");

      // Find the user's specific rating
      const userRating = thisPostRating.find(
        (rating) => rating.userId === currentUserId,
      );
      setYourRating(userRating ? userRating.rating : null);
    } else {
      setRatingPost(0);
      setMax(" รีวิว");
      setYourRating(null);
    }
  }, [availableRating, hireid, currentUserId]);
  const ratingCompleted = (rating) => {
    // jobId ควรมาจากที่ไหนก็ได้ตามที่คุณเก็บ jobId ไว้ // ต้องแก้ตามที่คุณใช้
    dispatch(hireRating(hireid, rating));
    console.log("Rating is: " + rating);
  };
  console.log(yourRating);
  return (
    <View style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* --- ส่วนหัว: ข้อมูลผู้โพสต์ (Profile Header) --- */}
        <View style={styles.profileHeaderCard}>
          <TouchableOpacity
            style={styles.profileRow}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate("OtherProfile", { id: postOwner?.id })
            }
          >
            {/* ส่วนรูปโปรไฟล์ */}
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri:
                    postOwner?.imageUrl ||
                    "https://ui-avatars.com/api/?name=User&background=E4E9F2&color=666",
                }}
                style={styles.profileHeaderImg}
              />
            </View>

            {/* ส่วนข้อมูลและเรตติ้ง (จัดให้อยู่ในคอลัมน์เดียวกัน) */}
            <View style={styles.profileHeaderTextInfo}>
              <Text style={styles.profileNameText} numberOfLines={1}>
                {postOwner?.firstName} {postOwner?.lastName}
              </Text>
              <Text style={styles.profileJobText} numberOfLines={1}>
                {postOwner?.job || "ไม่ระบุตำแหน่ง"}
              </Text>

              {/* Rating Pill Badge (ย้ายมาไว้ใต้ตำแหน่งงาน) */}
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingNumber}>
                  {ratingPost ? parseFloat(ratingPost).toFixed(1) : "0.0"}
                </Text>

                <Rating
                  readonly
                  startingValue={ratingPost ? parseFloat(ratingPost) : 0}
                  imageSize={12} // ลดขนาดดาวลงให้พอดีกับ Badge
                  tintColor="#083C6B"
                  type="custom"
                  ratingBackgroundColor="#54789B"
                  style={styles.starsWrapper}
                />

                <Text style={styles.reviewCountText}>
                  ({thisAllPostRating?.length || 0} รีวิว)
                </Text>
              </View>
            </View>

            <Ionicons
              name="chevron-forward"
              size={24}
              color="#CBD5E1"
              style={styles.chevronIcon}
            />
          </TouchableOpacity>
        </View>
        {/* --- ส่วนรายละเอียดงาน (Job Details) --- */}
        <View style={styles.contentSection}>
          <Text style={styles.jobTitleText}>{displayedHire?.hireTitle}</Text>

          <Text style={styles.sectionHeader}>รายละเอียด</Text>
          <Text style={styles.descriptionText}>{displayedHire?.detail}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionHeader}>ช่องทางติดต่อ</Text>
          <View style={styles.contactRow}>
            <MaterialCommunityIcons
              name="email-outline"
              size={22}
              color="#083C6B"
            />
            <Text style={styles.contactText}>
              {displayedHire?.email || "ไม่ระบุ"}
            </Text>
          </View>
          <View style={styles.contactRow}>
            <MaterialCommunityIcons
              name="phone-outline"
              size={22}
              color="#083C6B"
            />
            <Text style={styles.contactText}>
              {displayedHire?.phone || "ไม่ระบุ"}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* --- ส่วน Resume / ผลงาน --- */}
          <Text style={styles.sectionHeader}>เรซูเม่ / ผลงาน</Text>
          <TouchableOpacity
            style={styles.resumeContainer}
            activeOpacity={0.8}
            onPress={() => setModalVisible(true)}
          >
            <Image
              source={{ uri: displayedHire?.resumeUrl }}
              style={styles.resumeThumbnail}
            />
            <View style={styles.resumeOverlay}>
              <Ionicons name="scan-circle-outline" size={40} color="white" />
              <Text style={styles.resumeOverlayText}>แตะเพื่อดูรูปเต็ม</Text>
            </View>
          </TouchableOpacity>

          {/* Modal สำหรับดูรูปเต็ม */}
          <Modal
            isVisible={isModalVisible}
            style={{ margin: 0 }} // ให้ Modal เต็มจอ
            onBackdropPress={() => setModalVisible(false)}
          >
            <ImageViewer
              imageUrls={images}
              index={0}
              onSwipeDown={() => setModalVisible(false)}
              enableSwipeDown={true}
            />
            <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>
          </Modal>

          <View style={styles.divider} />

          {/* --- Action Buttons (Edit / Rate) --- */}
          {currentUserId === displayedHire?.postById ? (
            <TouchableOpacity style={styles.primaryButton} onPress={pickImage}>
              <Ionicons
                name="image-outline"
                size={20}
                color="white"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.primaryButtonText}>แก้ไขรูปภาพผลงาน</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.ratingBox}>
              <Text style={styles.ratingBoxTitle}>ให้คะแนนฟรีแลนซ์คนนี้</Text>
              <Rating
                showRating={false}
                onFinishRating={ratingCompleted}
                imageSize={32}
                startingValue={yourRating || 0}
              />
            </View>
          )}

          {/* --- ส่วนความคิดเห็น (Comments) --- */}
          <Text style={styles.commentHeader}>
            ความคิดเห็น ({thisFliteredPostComment?.length || 0})
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
              <MaterialCommunityIcons name="send" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {thisFliteredPostComment?.map((comment, index) => (
            <View key={index} style={styles.commentItem}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("OtherProfile", { id: comment?.userId })
                }
              >
                <Image
                  source={{
                    uri:
                      comment?.userImage ||
                      `https://ui-avatars.com/api/?name=${comment?.userfistName}&background=083C6B&color=fff`,
                  }}
                  style={styles.commentAvatar}
                />
              </TouchableOpacity>
              <View style={styles.commentContentBox}>
                <Text style={styles.commentName}>
                  {comment?.userfistName} {comment?.userlastName}
                </Text>
                <Text style={styles.commentText}>{comment?.comment}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* --- ปุ่มแก้ไขโพสต์สำหรับเจ้าของ (Floating Action Button) --- */}
      {currentUserId === displayedHire?.postById && (
        <TouchableOpacity
          style={styles.fabEdit}
          onPress={() =>
            navigation.navigate("EditHire", { id: displayedHire?.id })
          }
        >
          <MaterialCommunityIcons name="pencil" size={24} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  profileHeaderCard: {
    backgroundColor: "#083C6B", // สีน้ำเงินเข้ม
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    // เพิ่ม Shadow ให้ดูมีมิติ
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    // เพิ่มขอบขาวรอบรูปโปรไฟล์ให้ดูเด่นขึ้น
    borderRadius: 35,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.2)",
    padding: 2,
  },
  profileHeaderImg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E4E9F2",
  },
  profileHeaderTextInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "center",
  },
  profileNameText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  profileJobText: {
    fontSize: 14,
    color: "#CBD5E1",
    marginBottom: 8, // เว้นระยะก่อนถึงกล่องเรตติ้ง
  },
  // --- Rating Pill Badge ---
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start", // ให้กล่องหดพอดีกับตัวหนังสือ
    backgroundColor: "#0000", // พื้นหลังโปร่งแสง (Glassmorphism)
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20, // ขอบมนเป็นแคปซูล
  },
  ratingNumber: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginRight: 6,
  },
  starsWrapper: {
    marginRight: 6,
  },
  reviewCountText: {
    fontSize: 12,
    color: "#E2E8F0",
  },
  chevronIcon: {
    marginLeft: 10,
  },
  
  ratingContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  
  
  verticalDivider: {
    width: 1,
    height: 14,
    backgroundColor: "rgba(255, 255, 255, 0.3)", // เส้นคั่นระหว่างดาวกับจำนวนรีวิว
    marginRight: 10,
  },

  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

 
 

  
  
  ratingContainer: {
    marginTop: 16,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingScoreText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  ratingCountText: {
    fontSize: 14,
    color: "#E2E8F0",
  },
  contentSection: {
    padding: 20,
  },
  jobTitleText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#083C6B",
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 15,
    color: "#4A5568",
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: "#E4E9F2",
    marginVertical: 20,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  contactText: {
    fontSize: 15,
    color: "#333",
    marginLeft: 12,
  },
  resumeContainer: {
    width: "100%",
    height: 200,
    backgroundColor: "#E4E9F2",
    borderRadius: 16,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  resumeThumbnail: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  resumeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  resumeOverlayText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 8,
  },
  closeModalBtn: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
  },
  primaryButton: {
    flexDirection: "row",
    backgroundColor: "#083C6B",
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  ratingBox: {
    backgroundColor: "#F8FAFC",
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
    marginTop: 24,
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
  commentItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  commentContentBox: {
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
  commentText: {
    fontSize: 14,
    color: "#4A5568",
    lineHeight: 20,
  },
  fabEdit: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "#FF9800", // ใช้สีส้มเพื่อให้ปุ่มแก้ไขเด่นชัดขึ้นบนพื้นน้ำเงิน
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
export default HireJobDetailScreen;
