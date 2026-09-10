import React from "react";
import { FlatList, View, StyleSheet } from "react-native";
import MealItem from "../components/MealItem";

const MealList = (props) => {
  const renderMealItem = (itemData) => {
    return (
    <MealItem
        title={itemData.item.title}
        duration={itemData.item.duration}
        complexity={itemData.item.complexity}
        affordability={itemData.item.affordability}
        image={itemData.item.imageUrl}
        onSelectMeal={() => {
          // เขียนโค้ดเพิ่ม
          props.navigation.navigate("MealDetail", {
            prev: "CategoryMeals",
            id: itemData.item.id,
            title: itemData.item.title,
            steps: itemData.item.steps,
          });
        }}
      />
    )
  };

  return (
    <View style={styles.list}>
      <FlatList
        data = {props.listData}
        // listData = {props.data}
        renderItem={renderMealItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MealList;



