import React, { useState, useEffect } from 'react';
import { storage, db } from '../firebase';
import { listAll, getDownloadURL, ref } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { collection, query, where, getDocs } from 'firebase/firestore';
import * as tf from '@tensorflow/tfjs';

export default function Analyzer() {
    const [model, setModel] = useState(null);
    const [predictions, setPredictions] = useState([]);

    // Step 1: Load the model
    useEffect(() => {
        async function loadTFModel() {
            const loadedModel = await tf.loadLayersModel('http://localhost:8082/model.json');
            setModel(loadedModel);
        }
         loadTFModel();
    }, []);

    useEffect(() => {
        async function handleImages() {
            // Step 2: access the images in storage, get url for each image
            const storageRef = ref(storage);
            const res = await listAll(storageRef);
            const downloadURLs = await Promise.all(res.items.map(item => getDownloadURL(item)));
        
            const existingUrlsSnapshot = await getDocs(collection(db, 'images'));
            const existingUrls = existingUrlsSnapshot.docs.map(doc => doc.data().url);
            const imagesCollectionRef = collection(db, 'images');
            const imageDocRefs = [];
            
            for (const url of downloadURLs) {
                if (!existingUrls.includes(url)) {
                    const newDocRef = doc(imagesCollectionRef);
                    await setDoc(newDocRef, {
                        url: url,
                        status: "pending",
                        timestamp: new Date(),
                        result: ""
                    });
                    imageDocRefs.push(newDocRef);
                }
            }
        
            const querySnapshot = await getDocs(query(imagesCollectionRef, where("status", "==", "pending")));
            const fetchedImages = querySnapshot.docs.map(doc => ({
                id: doc.id,
                url: doc.data().url
            }));
        
            const newPredictions = [];
            for (const imageObj of fetchedImages) {
                // Step 3: Preprocess image
                const img = await loadImage(imageObj.url);
                const tensor = preprocessImage(img);
        
                if (model) {
                    // Step 4: Predict using the model
                    const prediction = model.predict(tensor);
                    const predictionValue = prediction.dataSync()[0];
                    const predictionResult = predictionValue > 0.5 ? "sick" : "healthy";
        
                    // Step 5: Update Firestore for each specific instances based on the imageobj id its looping over
                    const docRef = doc(db, 'images', imageObj.id);
                    await setDoc(docRef, {
                        status: "analyzed",
                        result: predictionResult
                    }, { merge: true });
        
                    // Save the predictions for each image as an object
                    newPredictions.push({
                        url: imageObj.url,
                        prediction: predictionResult
                    });
                }
            }
            setPredictions(newPredictions);
        }

        if (model) {
            handleImages();
        }
    }, [model]);

    const loadImage = (url) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    };

    const preprocessImage = (image) => {
        let tensor = tf.browser.fromPixels(image);
        
        tensor = tensor.div(255.0);
    
        tensor = tf.image.resizeBilinear(tensor, [256, 256]);
    
        return tensor.expandDims(0);
    };
    
    // Step 6: Render them on the screen
    const renderedImages = predictions.map((data, index) => (
        <div key={index}>
            <img className="rendered-images" src={data.url} alt={`image-${index}`} />
            <p className='health-status'>{`Prediction: ${data.prediction}`}</p>
        </div>
    ));

    return (
        <div className='analyzer-component-container'>
            {predictions.length === 0 ? 
            (<p className='loading-text'>Beep Boop... Your results are loading 🤖 </p>) : 
            renderedImages
            }
        </div>
    );
}

