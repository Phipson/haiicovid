from flask import Flask, request, render_template
from flask_socketio import SocketIO, emit
import os
import json
import numpy as np
import tensorflow as tf
from tensorflow import keras
from sklearn.preprocessing import MinMaxScaler
import joblib
from lime import lime_tabular

app = Flask(__name__, template_folder='../')
app.config['SECRET_KEY'] = 'secret!'

model = keras.models.load_model("covid-model.h5")
scaler = joblib.load("scaler.bin")

with open("dataX.npy", "rb") as f:
    a = np.load(f)
    explainer = lime_tabular.RecurrentTabularExplainer(a, feature_names=["cases"], class_names=["new_cases"], verbose=False, mode='regression')

def model_predict(val):
    return scaler.inverse_transform(model.predict(val))

@app.route('/predict_cases', methods=['GET', 'POST'])
def handle_prediction():
    print("Received prediction input: {}".format(request.json))
    cases = request.json["cases"]
    result = {}
    explain = {}
    for state, case in cases.items():
        print(state, case)
        input_vec = scaler.transform(np.array([case]))
        input_vec = input_vec.reshape((1, input_vec.shape[1], 1))
        result[state] = scaler.inverse_transform(model.predict(input_vec))[0].tolist()[0]
        explain[state] = explainer.explain_instance(input_vec, model.predict, num_features=1).as_list()[0]

    print(result)
    print(explain)

    # Get LIME Explanation
    # exp = explainer.explain_instance(cases, model_predict, num_features=1)
    # print(exp.as_list())

    return json.dumps({"result": result, "explanation": explain})

@app.route('/', methods=['GET', 'POST'])
def root_handler():
    return "Routed to Root"

app.run(debug=True, port=5000) #run app in debug mode on port 5000