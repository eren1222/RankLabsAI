import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
import re
import json
from flask import Flask
from flask_restful import Resource, Api
from flask_cors import CORS
import openai

# noinspection SpellCheckingInspection
openai.api_key = 'api-key'

# Read the CSV file into a Pandas DataFrame
df = pd.read_csv('./output.csv')


# Define the preprocessing function
def preprocess_text(text):
    if isinstance(text, str):
        # Remove punctuation and convert to lowercase
        text = re.sub(r'[^\w\s]', '', text.lower())

        # Tokenize the text
        tokens = word_tokenize(text)

        # Remove stopwords
        stop_words = set(stopwords.words('english'))
        tokens = [token for token in tokens if token not in stop_words]

        # Lemmatize the tokens
        lemmatizer = WordNetLemmatizer()
        tokens = [lemmatizer.lemmatize(token) for token in tokens]

        # Rejoin the tokens into a single string
        processed_text = ' '.join(tokens)

        return processed_text
    else:
        return ''


# noinspection PyTypeChecker
def find_similar(user_input, top_n):
    # Preprocess user input
    preprocessed_input = preprocess_text(user_input)

    # Preprocess startup descriptions
    preprocessed_descriptions = df['description'].apply(preprocess_text)

    # Create TF-IDF vectors
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(preprocessed_descriptions)

    # Compute cosine similarity between user input and startup descriptions
    input_vector = vectorizer.transform([preprocessed_input])
    similarity_scores = cosine_similarity(input_vector, tfidf_matrix)[0]

    # Add similarity scores to DataFrame
    df['similarity'] = similarity_scores

    data = json.loads(df.nlargest(top_n, 'similarity').to_json(orient="index"))
    info = json.loads(generate_startup_info(user_input))
    data["value_map"] = info["value_map"]["products_and_services"][0]
    data["customer_profile"] = info["customer_profile"]["gains"][0]

    return data


def generate_startup_info(description):
    class Startup:
        def __init__(self, desc):
            self.description = desc

        def generate_value_map(self):
            valueMap = {
                'products_and_services': []
            }

            response = openai.Completion.create(
                engine='text-davinci-003',
                prompt=f"Value map for startup: {self.description}\nProducts and services:",
                temperature=0.5,
                max_tokens=50,
                n=1,
                stop=None
            )

            valueMap['products_and_services'].append(response.choices[0].text.strip())

            return valueMap

        def create_customer_profile(self):
            customerprofile = {
                'gains': []
            }

            response = openai.Completion.create(
                engine='text-davinci-003',
                prompt=f"Customer profile for startup: {self.description}\nGains:",
                temperature=0.5,
                max_tokens=50,
                n=1,
                stop=None
            )

            customerprofile['gains'].append(response.choices[0].text.strip())

            return customerprofile

    startup = Startup(description)

    value_map = startup.generate_value_map()
    customer_profile = startup.create_customer_profile()

    startup_info = {
        'value_map': value_map,
        'customer_profile': customer_profile
    }

    return json.dumps(startup_info)


"""def ask_gpt(question):
    messages = [{"role": "system", "content":
        "You are an assistant working for a website which is for startups. It's main purpose is to get description "
        "for the startup ideas and show similar and make suggestions on how to build it."}]

    if not question:
        return {"answer": "Error!"}

    messages.append(
        {"role": "user", "content": question},
    )

    chat = openai.ChatCompletion.create(
        model="gpt-3.5-turbo", messages=messages
    )

    return {"answer": chat.choices[0].message.content}
"""

flask_instance = Flask(__name__)
cors = CORS(flask_instance)
flask_instance.config['CORS_HEADERS'] = 'Content-Type'
api = Api(flask_instance)


class Find(Resource):
    @staticmethod
    def get(description):
        return find_similar(description, 5)


# noinspection PyTypeChecker
class AskGPT(Resource):
    @staticmethod
    def get(question):
        return {"answer": question}
        # return ask_gpt(question)


api.add_resource(Find, '/find/<string:description>')
api.add_resource(AskGPT, '/ask/<string:question>')

if __name__ == '__main__':
    flask_instance.run(host='0.0.0.0', port=80, debug=True)
