import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { theme } from "./colors";
import { Feather } from "@expo/vector-icons";
import AnimatedColorView from "react-native-animated-colors";

const STORAGE_KEY = "@toDos";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [editText, setEditText] = useState("");
  const [toDos, setToDos] = useState({});
  const [editKey, setEditKey] = useState("");
  useEffect(() => {
    loadLastLocation();
    loadToDos();
  }, []);
  useEffect(() => {
    AsyncStorage.setItem("@lastLocation", JSON.stringify(working));
  }, [working]);
  const travel = () => setWorking(false);
  const work = () => setWorking(true);
  const saveToDos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };
  const loadLastLocation = async () => {
    const l = JSON.parse(await AsyncStorage.getItem("@lastLocation"));
    setWorking(l);
  };
  const loadToDos = async () => {
    const s = JSON.parse(await AsyncStorage.getItem(STORAGE_KEY));
    setToDos(s ? s : {});
    setLoading(false);
  };
  const addToDo = async () => {
    if (text === "") {
      return;
    }
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, complete: false },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };
  const completeToDo = async (key) => {
    const newToDos = { ...toDos };
    newToDos[key].complete = !newToDos[key].complete;
    setToDos(newToDos);
    await saveToDos(newToDos);
  };
  const editToDo = (key) => {
    if (key === editKey) {
      setEditKey("");
      setEditText("");
    } else {
      setEditKey(key);
    }
  };
  const editDone = async (key) => {
    if (editText === "") {
      return;
    }
    const newToDos = { ...toDos };
    newToDos[key].text = editText;
    setToDos(newToDos);
    await saveToDos(newToDos);
    setEditKey("");
    setEditText("");
  };
  const deleteToDo = (key) => {
    if (Platform.OS === "web") {
      const ok = confirm("Delete To Do");

      if (ok) {
        const newToDos = { ...toDos };
        delete newToDos[key];
        setToDos(newToDos);
        saveToDos(newToDos);
      }
    } else {
      Alert.alert("Delete To Do", "Are you ", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sure",
          style: "destructive",
          onPress: () => {
            const newToDos = { ...toDos };
            delete newToDos[key];
            setToDos(newToDos);
            saveToDos(newToDos);
          },
        },
      ]);
    }
  };
  return (
    <AnimatedColorView
      style={styles.container}
      activeIndex={working ? 0 : 1}
      colors={[theme.white, theme.black]}
      duration={700}
      loop={false}
    >
      <StatusBar style={working ? "dark" : "light"} />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{
              ...styles.btnText,
              color: working ? theme.blackDark : theme.greyDark,
            }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? theme.whiteLight : theme.greyLight,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator
            style={{ marginTop: 10 }}
            color="white"
            size="large"
          />
        </View>
      ) : (
        <>
          <TextInput
            returnKeyType="done"
            onSubmitEditing={addToDo}
            onChangeText={(payload) => setText(payload)}
            value={text}
            placeholder={working ? "Add a To Do" : "Where do you want to go?"}
            style={{
              ...styles.input,
              zIndex: 1,
              backgroundColor: working ? theme.whiteLight : theme.blackLight,
              color: working ? theme.blackLight : theme.whiteLight,
            }}
            placeholderTextColor={theme.grey}
          />
          <ScrollView>
            {[...Object.keys(toDos)].reverse().map((key) =>
              toDos[key].working === working ? (
                <View
                  style={{
                    ...styles.toDo,
                    backgroundColor: working
                      ? theme.whiteLight
                      : theme.blackLight,
                  }}
                  key={key}
                >
                  {key === editKey ? (
                    <TextInput
                      returnKeyType="done"
                      onSubmitEditing={() => editDone(key)}
                      onChangeText={(payload) => setEditText(payload)}
                      value={editText}
                      placeholder={toDos[key].text}
                      placeholderTextColor={theme.grey}
                      style={{
                        ...styles.editInput,
                        color: working ? theme.blackLight : theme.whiteLight,
                      }}
                    />
                  ) : (
                    <Text
                      style={[
                        {
                          ...styles.toDoText,
                          color: working ? theme.blackDark : theme.whiteLight,
                        },
                        toDos[key].complete && styles.toDoComplete,
                      ]}
                    >
                      {toDos[key].text}
                    </Text>
                  )}

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {!toDos[key].complete && (
                      <TouchableOpacity
                        style={styles.toDoBtn}
                        onPress={() => editToDo(key)}
                      >
                        <Feather name="edit-2" size={18} color={theme.grey} />
                      </TouchableOpacity>
                    )}
                    {key !== editKey && (
                      <>
                        <TouchableOpacity
                          style={styles.toDoBtn}
                          onPress={() => deleteToDo(key)}
                        >
                          <Feather name="delete" size={18} color={theme.grey} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.toDoBtn}
                          onPress={() => completeToDo(key)}
                        >
                          <Feather
                            name={
                              toDos[key].complete ? "check-square" : "square"
                            }
                            size={18}
                            color={theme.grey}
                          />
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              ) : null
            )}
          </ScrollView>
        </>
      )}
    </AnimatedColorView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.white,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
    color: theme.blackDark,
  },
  input: {
    backgroundColor: theme.whiteLight,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.whiteLight,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: theme.blackDark,
    fontSize: 16,
    fontWeight: "500",
  },
  toDoBtn: {
    marginLeft: 10,
  },
  toDoComplete: {
    textDecorationLine: "line-through",
  },
  editInput: {
    fontSize: 16,
    fontWeight: "500",
  },
});
