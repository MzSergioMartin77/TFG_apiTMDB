# -*- coding: utf-8 -*-
"""recomendadorJson.ipynb

Automatically generated by Colaboratory.

Original file is located at
    https://colab.research.google.com/drive/1in9aGziUeoA3eO_P1WyM3n2g4nJtyIM-
"""

# Commented out IPython magic to ensure Python compatibility.
from gettext import install
from typing import Dict, Text

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import os
import warnings

warnings.filterwarnings('ignore')
# %matplotlib inline

import tensorflow as tf

# os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

ratings_df = pd.read_json('./datos.json') 
ratings_df.head()

print(ratings_df.shape)
print(ratings_df.userId.nunique())
print(ratings_df.movieId.nunique())
ratings_df.isna().sum()

nmovie_id = ratings_df.movieId.nunique()
nuser_id = ratings_df.userId.nunique()

print(nmovie_id)
print(nuser_id)
print(ratings_df)

#movie input network
input_movies = tf.keras.layers.Input(shape=[1])
print(input_movies)
embed_movies = tf.keras.layers.Embedding(nmovie_id + 1, 15)(input_movies)
movies_out = tf.keras.layers.Flatten()(embed_movies)

#user input network
input_users = tf.keras.layers.Input(shape=[1])
embed_users = tf.keras.layers.Embedding(nuser_id + 1, 15)(input_users)
users_out = tf.keras.layers.Flatten()(embed_users)

conc_layer = tf.keras.layers.Concatenate()([movies_out, users_out])
x = tf.keras.layers.Dense(128, activation='relu')(conc_layer)
x_out = tf.keras.layers.Dense(1, activation='relu')(x)
model = tf.keras.Model([input_movies, input_users], x_out)

opt = tf.keras.optimizers.Adam(learning_rate=0.001)
model.compile(optimizer=opt, loss='mean_squared_error')
model.summary()

model.fit([ratings_df.movieId, ratings_df.userId], ratings_df.nota, batch_size=30, epochs=20, verbose=1)

model.save(('./modeltf'))
print("Modelo guardado")

os.system("conda activate C:/Users/Sergi/Anaconda3/envs/tensorflowks & tensorflowjs_converter --input=keras_saved_model  modeltf modeltfjs")

