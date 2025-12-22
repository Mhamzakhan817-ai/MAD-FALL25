import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

const GOLD = "#D4A017";
const BLACK = "#000";

export default function SizeChartModal({ onClose }) {
  const [yards, setYards] = useState("");
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");

  const [suggestion, setSuggestion] = useState("");
  const [fabricNeeds, setFabricNeeds] = useState({
    shirt: "",
    trouser: "",
    shalwarKameez: "",
  });

  // -------------------------------
  // Convert everything to inches
  // -------------------------------
  const totalInches = () => {
    const y = parseFloat(yards) || 0;
    const f = parseFloat(feet) || 0;
    const i = parseFloat(inches) || 0;
    return y * 36 + f * 12 + i;
  };

  // -------------------------------
  // Input handlers (one-directional)
  // -------------------------------
  const handleYardsChange = (v) => {
    setYards(v);
    if (v === "") return;

    const total = parseFloat(v) * 36;
    setFeet(Math.floor(total / 12).toString());
    setInches(Math.round(total % 12).toString());
  };

  const handleFeetChange = (v) => {
    setFeet(v);
    if (v === "") return;

    const f = parseFloat(v) || 0;
    const i = parseFloat(inches) || 0;
    const total = f * 12 + i;
    setYards((total / 36).toFixed(2));
  };

  const handleInchesChange = (v) => {
    setInches(v);
    if (v === "") return;

    const i = parseFloat(v) || 0;
    const f = parseFloat(feet) || 0;
    const total = i + f * 12;
    setYards((total / 36).toFixed(2));
  };

  // -------------------------------
  // Recommendations
  // -------------------------------
  useEffect(() => {
    const t = totalInches();

    if (t <= 36) setSuggestion("You can cut this from 1 yard.");
    else if (t <= 72) setSuggestion("This needs about 2 yards of fabric.");
    else if (t <= 108) setSuggestion("3 yards recommended.");
    else setSuggestion("Consider buying bulk fabric (4 yards or more).");

    setFabricNeeds({
      shirt: "Shirt: 2 – 2.5 yards (adult), 1.5 yards (kids)",
      trouser: "Trouser: 1.25 – 1.75 yards",
      shalwarKameez: "Shalwar Kameez: 3.5 – 4.5 yards",
    });
  }, [yards, feet, inches]);

  return (
    <View style={styles.modalBox}>
      <Text style={styles.title}>Size Conversion & Fabric Calculator</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Yards:</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={yards}
          onChangeText={handleYardsChange}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Feet:</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={feet}
          onChangeText={handleFeetChange}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Inches:</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={inches}
          onChangeText={handleInchesChange}
        />
      </View>

      <Text style={styles.previewTitle}>Converted:</Text>
      <Text style={styles.previewValue}>
        {yards || 0} yd = {feet || 0} ft {inches || 0} in
      </Text>

      <Text style={styles.sectionTitle}>Fabric Recommendation:</Text>
      <Text style={styles.suggestionText}>{suggestion}</Text>

      <Text style={styles.sectionTitle}>Tailoring Estimates:</Text>
      <Text style={styles.suggestionText}>{fabricNeeds.shirt}</Text>
      <Text style={styles.suggestionText}>{fabricNeeds.trouser}</Text>
      <Text style={styles.suggestionText}>{fabricNeeds.shalwarKameez}</Text>

      <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
        <Text style={styles.closeText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
}

// ------------------ STYLES ------------------
const styles = StyleSheet.create({
  modalBox: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: GOLD,
    textAlign: "center",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: "#444",
  },
  input: {
    backgroundColor: "#f4f4f4",
    width: 100,
    padding: 8,
    textAlign: "center",
    borderRadius: 8,
    fontSize: 16,
  },
  previewTitle: {
    marginTop: 10,
    fontWeight: "700",
    color: BLACK,
  },
  previewValue: {
    fontSize: 18,
    color: GOLD,
    fontWeight: "700",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 10,
    color: BLACK,
  },
  suggestionText: {
    fontSize: 15,
    color: "#555",
    marginBottom: 6,
  },
  closeBtn: {
    backgroundColor: BLACK,
    padding: 12,
    borderRadius: 10,
    marginTop: 18,
  },
  closeText: {
    color: GOLD,
    fontWeight: "700",
    textAlign: "center",
    fontSize: 16,
  },
});
