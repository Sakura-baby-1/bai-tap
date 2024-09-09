import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const StatisticsScreen = ({ goals, onClose }) => {
  const totalGoals = goals.length;
  const completedGoals = goals.filter(goal => goal.isCompleted).length;
  const incompleteGoals = totalGoals - completedGoals;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thống Kê</Text>
      <Text style={styles.statistic}>Tổng số mục tiêu: {totalGoals}</Text>
      <Text style={styles.statistic}>Mục tiêu hoàn thành: {completedGoals}</Text>
      <Text style={styles.statistic}>Mục tiêu chưa hoàn thành: {incompleteGoals}</Text>
      <Button title="Đóng" onPress={onClose} color="grey" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statistic: {
    fontSize: 18,
    marginBottom: 10,
  },
});

export default StatisticsScreen;
