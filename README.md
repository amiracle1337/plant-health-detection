# LunarLeaf: Automated Plant Health Detection 

LunarLeaf integrates machine learning models with an intuitive frontend to automatically assess the health of vegetables grown in our indoor aeroponic farm. The project capitalizes on the power of Convolutional Neural Networks (CNNs) for image recognition and React for frontend development, all tied together with Firebase as the real-time database.

[![LG UltraFine](https://github.com/amiracle1337/plant-health-detection/assets/122039464/53158b1d-eea1-4601-9651-c26e90991e32)](https://www.youtube.com/watch?v=Y7CumIW4SRY&feature=youtu.be)

---

## Background

In our pursuit to cultivate vegetables with 90% less water than traditional methods, Twana Cheragwandi and I constructed an indoor aeroponic farm. The challenge arose in routinely monitoring plant health. Thus, the concept of LunarLeaf emerged:

- **Robot Integration**: Led by Twana Cheragwandi, we designed a robot to automate daily image captures of the plants.
  
- **Machine Learning**: My responsibility encompassed developing a machine learning model, LunarLeaf, to analyze these images and discern the health status of our vegetables. The core of the model is based on CNNs, optimizing its design over multiple iterations. For a deep dive into the model design process, check the [Click here to learn more about the models architecture](https://github.com/amiracle1337/lunarleaf-ml-model)


- **Frontend & Backend**: To bring predictions to life, I designed a frontend using React. Firebase, acting as our database, seamlessly integrates with Twana's robot, ensuring every captured image triggers an automatic prediction by the model.

---

## Current Features

- **Real-time Predictions**: Instantly predicts plant health once an image is uploaded to the Firebase database.
  
- **Minimalistic UI**: A straightforward user interface for viewing the most recent predictions.

---

## Future Enhancements

1. **UI Overhaul**: Envision a more intuitive and interactive user interface.
  
2. **Data Trends**: Integration of trend visualization tools to monitor plant health over time.

3. **Historical Data**: A dashboard to navigate through predictions based on specific dates.

---

## Acknowledgements

This marked my initial venture into both machine learning and backend development. I'm grateful for the learning curve and the tangible results achieved. Collaboration with Twana Cheragwandi was instrumental in making LunarLeaf a reality.

---

## Contact

amir@amiracle.xyz
twanahc@gmail.com


