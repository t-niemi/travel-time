# Travel-time app

A simple app utilizing the open Helsinki Region Travel Time Matrix from: https://zenodo.org/records/11220980

When given an adress, the app shows typical rush hour travel times to that address from other places using public transport.

Live version available at: https://travel-time-irez.onrender.com/

Due to the limitiations of the Render free tier postgres database (size < 1GB), the live version is limited to data within 10 km from the city center of Helsinki. The full data covers much larger area (~7GB).
