import Analyzer from "./components/Analyzer"
import { useState } from "react";
import { storage } from "./firebase";
import { ref } from "firebase/storage"


export default function App() {
  return (
    <div className="app-container">
      <Analyzer />
    </div>
  );
}
