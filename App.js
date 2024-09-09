import React, { useState, useMemo } from 'react';
import {
  StyleSheet, View, Text, TextInput, Button, FlatList,
  Pressable, Modal, Alert, useWindowDimensions, KeyboardAvoidingView,
  Platform, StatusBar, Image, ScrollView
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function App() {
  const [courseGoals, setCourseGoals] = useState([]);
  const [history, setHistory] = useState([]);
  const [enteredTask, setEnteredTask] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [filterDate, setFilterDate] = useState(new Date());
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [showIncomplete, setShowIncomplete] = useState(true); // true: chưa hoàn thành, false: đã hoàn thành

  const { width, height } = useWindowDimensions();
  const isPortrait = height > width;

  const buttonWidth = isPortrait ? width / 2 - 20 : width / 3 - 20;
  const buttonHeight = isPortrait ? 50 : 60;
  const imageWidth = width * 0.8;
  const imageHeight = imageWidth * 3 / 4;

  const onDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) setSelectedDate(date);
  };

  const onTimeChange = (event, date) => {
    setShowTimePicker(false);
    if (date) setSelectedTime(date);
  };

  const onFilterDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) setFilterDate(date);
  };

  const taskInputHandler = (text) => setEnteredTask(text);
  const searchInputHandler = (text) => setSearchQuery(text);

  const filterGoals = useMemo(() => {
    return courseGoals.filter(goal =>
      goal.task.toLowerCase().includes(searchQuery.toLowerCase()) &&
      new Date(goal.date).toDateString() === filterDate.toDateString() &&
      (showIncomplete ? !goal.isCompleted : goal.isCompleted)
    );
  }, [courseGoals, searchQuery, filterDate, showIncomplete]);

  const handleAddGoal = () => {
    Alert.alert(
      'Thêm Mục Tiêu',
      'Bạn có chắc chắn muốn thêm mục tiêu này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Thêm',
          onPress: () => {
            const newGoal = {
              id: Math.random().toString(),
              date: selectedDate.toDateString(),
              time: selectedTime.toLocaleTimeString(),
              task: enteredTask,
              isCompleted: false
            };
            setCourseGoals(prevGoals => [...prevGoals, newGoal]);
            setHistory(prevHistory => [
              ...prevHistory,
              { action: 'Thêm', goal: newGoal, timestamp: new Date().toLocaleString() }
            ]);
            resetForm();
            setModalVisible(false);
          }
        }
      ]
    );
  };

  const handleEditGoal = () => {
    Alert.alert(
      'Sửa Mục Tiêu',
      'Bạn có chắc chắn muốn sửa mục tiêu này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Sửa',
          onPress: () => {
            setCourseGoals(prevGoals =>
              prevGoals.map(goal =>
                goal.id === selectedGoal.id
                  ? { ...goal, date: selectedDate.toDateString(), time: selectedTime.toLocaleTimeString(), task: enteredTask, isCompleted: selectedGoal.isCompleted }
                  : goal
              )
            );
            setHistory(prevHistory => [
              ...prevHistory,
              { action: 'Sửa', goal: { id: selectedGoal.id, date: selectedDate.toDateString(), time: selectedTime.toLocaleTimeString(), task: enteredTask, isCompleted: selectedGoal.isCompleted }, timestamp: new Date().toLocaleString() }
            ]);
            resetForm();
            setActionModalVisible(false);
          }
        }
      ]
    );
  };

  const handleDeleteGoal = () => {
    Alert.alert(
      'Xóa Mục Tiêu',
      'Bạn có chắc chắn muốn xóa mục tiêu này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          onPress: () => {
            setCourseGoals(prevGoals =>
              prevGoals.filter(goal => goal.id !== selectedGoal.id)
            );
            setHistory(prevHistory => [
              ...prevHistory,
              { action: 'Xóa', goal: selectedGoal, timestamp: new Date().toLocaleString() }
            ]);
            setActionModalVisible(false);
          }
        }
      ]
    );
  };

  const handleToggleCompletion = (goal) => {
    setCourseGoals(prevGoals =>
      prevGoals.map(g =>
        g.id === goal.id ? { ...g, isCompleted: !g.isCompleted } : g
      )
    );
    setHistory(prevHistory => [
      ...prevHistory,
      { action: goal.isCompleted ? 'Hủy Hoàn Thành' : 'Hoàn Thành', goal: goal, timestamp: new Date().toLocaleString() }
    ]);
  };

  const showActionModal = (goal) => {
    setSelectedGoal(goal);
    setSelectedDate(new Date(goal.date));
    setSelectedTime(new Date(`1970-01-01T${goal.time}`));
    setEnteredTask(goal.task);
    setActionModalVisible(true);
  };

  const showHistoryModal = () => setHistoryModalVisible(true);
  const showReportModal = () => setReportModalVisible(true);

  const getStatusBarStyle = () => (isPortrait ? 'dark-content' : 'light-content');
  const getStatusBarBackgroundColor = () => (isPortrait ? '#ffffff' : '#e0e0e0');

  const resetForm = () => {
    setEnteredTask('');
    setSelectedDate(new Date());
    setSelectedTime(new Date());
  };

  const totalGoals = courseGoals.length;
  const completedGoals = courseGoals.filter(goal => goal.isCompleted).length;
  const incompleteGoals = totalGoals - completedGoals;

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <StatusBar
        barStyle={getStatusBarStyle()}
        backgroundColor={getStatusBarBackgroundColor()}
      />
      <FlatList
        ListHeaderComponent={() => (
          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Nguyễn Anh Tuấn - 2124802010347</Text>

            <Image
              source={require('./assets/cong-nghe-thong-tin-4-0.jpg')}
              style={[styles.image, { width: imageWidth, height: imageHeight }]}
            />

            <View style={styles.buttonContainer(isPortrait)}>
              <Button
                title="Mục tiêu chưa hoàn thành"
                onPress={() => setShowIncomplete(true)}
                color={showIncomplete ? "#4caf50" : "#e0e0e0"}
              />
              <Button
                title="Mục tiêu hoàn thành"
                onPress={() => setShowIncomplete(false)}
                color={!showIncomplete ? "#f44336" : "#e0e0e0"}
              />
              <Button 
                title="Thêm Mục Tiêu Mới" 
                onPress={() => setModalVisible(true)} 
                color="#4caf50" 
              />
              <Button 
                title="Xem Lịch Sử" 
                onPress={showHistoryModal} 
                color="#2196f3" 
              />
              <Button 
                title="Thống Kê"
                onPress={showReportModal} 
                color="#ff9800" 
              />
            </View>

            <TextInput
              placeholder="Tìm kiếm mục tiêu"
              style={styles.searchInput(isPortrait)}
              onChangeText={searchInputHandler}
              value={searchQuery}
            />

            <Button title="Chọn Ngày Lọc" onPress={() => setShowDatePicker(true)} color="#4caf50" />
            {showDatePicker && (
              <DateTimePicker
                mode="date"
                value={filterDate}
                display="default"
                onChange={onFilterDateChange}
              />
            )}
          </ScrollView>
        )}
        data={filterGoals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => showActionModal(item)}
            style={styles.goalItem}
          >
            <Text style={styles.goalText}>{item.task}</Text>
            <Text style={styles.goalDate}>{`${item.date} ${item.time}`}</Text>
            <Button
              title={item.isCompleted ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu hoàn thành'}
              onPress={() => handleToggleCompletion(item)}
              color={item.isCompleted ? '#f44336' : '#4caf50'}
            />
          </Pressable>
        )}
        ListFooterComponent={() => (
          <>
            <Modal visible={modalVisible} animationType="slide">
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Thêm Mục Tiêu</Text>
                <TextInput
                  placeholder="Nhập mục tiêu"
                  style={styles.input}
                  onChangeText={taskInputHandler}
                  value={enteredTask}
                />
                <Button title="Chọn Ngày" onPress={() => setShowDatePicker(true)} color="#4caf50" />
                {showDatePicker && (
                  <DateTimePicker
                    mode="date"
                    value={selectedDate}
                    display="default"
                    onChange={onDateChange}
                  />
                )}
                <Button title="Chọn Thời Gian" onPress={() => setShowTimePicker(true)} color="#4caf50" />
                {showTimePicker && (
                  <DateTimePicker
                    mode="time"
                    value={selectedTime}
                    display="default"
                    onChange={onTimeChange}
                  />
                )}
                <Button title="Thêm" onPress={handleAddGoal} color="#4caf50" />
                <Button title="Hủy" onPress={() => setModalVisible(false)} color="#f44336" />
              </View>
            </Modal>

            <Modal visible={actionModalVisible} animationType="slide">
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Sửa Mục Tiêu</Text>
                <TextInput
                  placeholder="Nhập mục tiêu"
                  style={styles.input}
                  onChangeText={taskInputHandler}
                  value={enteredTask}
                />
                <Button title="Chọn Ngày" onPress={() => setShowDatePicker(true)} color="#4caf50" />
                {showDatePicker && (
                  <DateTimePicker
                    mode="date"
                    value={selectedDate}
                    display="default"
                    onChange={onDateChange}
                  />
                )}
                <Button title="Chọn Thời Gian" onPress={() => setShowTimePicker(true)} color="#4caf50" />
                {showTimePicker && (
                  <DateTimePicker
                    mode="time"
                    value={selectedTime}
                    display="default"
                    onChange={onTimeChange}
                  />
                )}
                <Button title="Sửa" onPress={handleEditGoal} color="#4caf50" />
                <Button title="Xóa" onPress={handleDeleteGoal} color="#f44336" />
                <Button title="Hủy" onPress={() => setActionModalVisible(false)} color="#e0e0e0" />
              </View>
            </Modal>

            <Modal visible={historyModalVisible} animationType="slide">
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Lịch Sử</Text>
                <FlatList
                  data={history}
                  keyExtractor={(item) => item.timestamp}
                  renderItem={({ item }) => (
                    <View style={styles.historyItem}>
                      <Text>{`${item.timestamp}: ${item.action} - ${item.goal.task}`}</Text>
                    </View>
                  )}
                />
                <Button title="Đóng" onPress={() => setHistoryModalVisible(false)} color="#f44336" />
              </View>
            </Modal>

            <Modal visible={reportModalVisible} animationType="slide">
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Thống Kê</Text>
                <Text>Tổng số mục tiêu: {totalGoals}</Text>
                <Text>Mục tiêu hoàn thành: {completedGoals}</Text>
                <Text>Mục tiêu chưa hoàn thành: {incompleteGoals}</Text>
                <FlatList
                  data={courseGoals}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View style={styles.goalItem}>
                      <Text style={styles.goalText}>{item.task}</Text>
                      <Text style={styles.goalDate}>{`${item.date} ${item.time}`}</Text>
                      <Text>Trạng thái: {item.isCompleted ? 'Hoàn thành' : 'Chưa hoàn thành'}</Text>
                    </View>
                  )}
                />
                <Button title="Đóng" onPress={() => setReportModalVisible(false)} color="#f44336" />
              </View>
            </Modal>
          </>
        )}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  image: {
    borderRadius: 10,
    marginVertical: 20,
    alignSelf: 'center',
  },
  buttonContainer: (isPortrait) => ({
    flexDirection: isPortrait ? 'column' : 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 10,
  }),
  searchInput: (isPortrait) => ({
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 10,
    width: isPortrait ? '100%' : '90%',
  }),
  goalItem: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalText: {
    fontSize: 16,
    flex: 1,
  },
  goalDate: {
    fontSize: 12,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  historyItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
});
