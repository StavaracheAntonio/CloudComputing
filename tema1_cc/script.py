import requests
import time
import _thread

def req():
    resp = requests.post('http://localhost:3000/', json={"Iasi": "Bucharest"})
    return resp

def url_req():
    import urllib
    from urllib import request
    import json
    url = 'http://localhost:3000/search-json/?city1=iasi&city2=Bucharest'

    try:
        response = urllib.request.urlopen(url).read()
        text = response.decode("utf-8")
        #print(text)
        return text

    except Exception as e:
        return -1

if __name__ == '__main__':
    batch_size = 50
    for i in range(10):
        for j in range(batch_size):
            _thread.start_new_thread(url_req, ())
        time.sleep(15)