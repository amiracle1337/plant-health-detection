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
        // because it takes time for the model to load, we use async function to wait until its completely loaded 
        async function loadTFModel() {
            const loadedModel = await tf.loadLayersModel('http://localhost:8082/model.json');
            setModel(loadedModel);
        }
        // we call the async function, it doesn't run before we've called it, we've just stated it. 
        // it then makes sure the model is loaded (await) before it sets state
         loadTFModel();
    }, []);

    useEffect(() => {
        async function handleImages() {
            // Step 2: access the images in storage, get url for each image
            const storageRef = ref(storage);
            const res = await listAll(storageRef);
            const downloadURLs = await Promise.all(res.items.map(item => getDownloadURL(item)));
        
            // get access to the "images" collection in firestore
            const existingUrlsSnapshot = await getDocs(collection(db, 'images'));
            // get access to the field "url" in firestore
            const existingUrls = existingUrlsSnapshot.docs.map(doc => doc.data().url);
            // getting access to the collection
            const imagesCollectionRef = collection(db, 'images');
            const imageDocRefs = [];
            
            for (const url of downloadURLs) {
                // Only set a document if this URL is new
                if (!existingUrls.includes(url)) {
                    // for each url creating a new document using the doc method in the collection we're passing in as an argument
                    const newDocRef = doc(imagesCollectionRef);
                    // then for each document we just created, we use setdoc method to add data into that document
                    await setDoc(newDocRef, {
                        url: url,
                        status: "pending",
                        timestamp: new Date(),
                        result: ""
                    });
                    imageDocRefs.push(newDocRef);
                }
            }
        
            // Fetch images based on metadata for analysis ("where" is a firebsae function) & query is used as firebase function to apply condition on the fetching you're doing
            const querySnapshot = await getDocs(query(imagesCollectionRef, where("status", "==", "pending")));
            const fetchedImages = querySnapshot.docs.map(doc => ({
                id: doc.id,
                url: doc.data().url
            }));
        
            const newPredictions = [];
        // at each iteration of the loop, the model is predicting on one image (tensor) at a time.
            for (const imageObj of fetchedImages) {
                // Step 3: Preprocess image
                // if resolved img contains data of the downloaded image
                const img = await loadImage(imageObj.url);
                // contais raw pixel values representing an image of size 256x256, and this data is stored as a tensor 
                const tensor = preprocessImage(img);
        
                if (model) {
                    // Step 4: Predict using the model
                    const prediction = model.predict(tensor);
                    // prediction is an array of tensors, using datasync method we get the probability it predicted at the 0 index 
                    // (it predicts one img at a time, because of the loop, but we still wanna access the value, even though theres only one probability in the array)
                    const predictionValue = prediction.dataSync()[0];
                    // e.g. it now has 0.6, which it will store in predictionresult as sick.
                    const predictionResult = predictionValue > 0.5 ? "sick" : "healthy";
        
                    // Step 5: Update Firestore for each specific instances based on the imageobj id its looping over
                    const docRef = doc(db, 'images', imageObj.id);
                    await setDoc(docRef, {
                        status: "analyzed",
                        result: predictionResult
                        // instructs Firestore to only update the fields specified in the data object and leave the other existing fields unchanged. 
                    }, { merge: true });
        
                    // Save the predictions for each image as an object
                    newPredictions.push({
                        url: imageObj.url,
                        prediction: predictionResult
                    });
                }
            }
            // set state as the array containg predictions in the form of an object for each image
            setPredictions(newPredictions);
        }

        if (model) {
            handleImages();
        }
    }, [model]);

    const loadImage = (url) => {
        return new Promise((resolve, reject) => {
            // creating a new html image instance
            const img = new Image();
            // allowing CORS to let the image be created and skip security
            img.crossOrigin = 'anonymous';
            // tells us when the image is loaded, "onload" is a built in event handeler in js and then resolves the promise plus sends the loaded img the const "loadimage" as its return
            img.onload = () => resolve(img);
            // if the onerror method is called aka it went sout, the reject is called telling the promise to not fulfill
            img.onerror = reject;
            // broswer starts to DOWNLOAD the image, the "onload" and "onerror" waits for this, if it fails or not. 
            img.src = url;
        });
    };

    const preprocessImage = (image) => {
        // Convert the image to a tensor aka (storing the image as pixel values in as a multi-dimensional array)
        let tensor = tf.browser.fromPixels(image);
        
        // normalize pixel values
        tensor = tensor.div(255.0);
    
        // Resize it to the expected size
        tensor = tf.image.resizeBilinear(tensor, [256, 256]);
    
        // Expand the tensor's dimensions to match the expected input shape (Networks expect batches of images, and we are creating a batch of 1 image per image in the 0th position, think how in kaggle you had batches in front of img size etc)
        return tensor.expandDims(0);
    };
    

    // Step 6: Render them on the screen
        // each "predictions" is an object with corresponding image and prediction - thats how they are rendered correctly 
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

