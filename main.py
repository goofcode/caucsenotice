import lion.message as plus_message

import json
import os
import time
import datetime

if __name__ == '__main__':
    current_path = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(current_path, 'data/data.json')
    with open(data_path, 'r', encoding='utf-8') as data_json:
        crawled = json.load(data_json)

    category_name = {"ict": "[ICT 공과대학]\n", "cse": "[컴퓨터공학부]\n", "accord": "[서울어코드]\n"}

    for ict_notice in crawled["ict"]:
        plus_message.send_basic_text_message(content=category_name["ict"] + ict_notice["title"],link=ict_notice["url"])
    for cse_notice in crawled["cse"]:
        plus_message.send_basic_text_message(content=category_name["cse"] + cse_notice["title"], link=cse_notice["url"])
    for accord_notice in crawled["accord"]:
        plus_message.send_basic_text_message(content=category_name["accord"] + accord_notice["title"], link=accord_notice["url"])


    num_msg = len(crawled["ict"]) + len(crawled["cse"]) + len(crawled["accord"])
   
    if num_msg is not 0:
        timestamp = '['+ datetime.datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d %H:%M:%S') + ']'
        log_str = timestamp + ': ' + str(num_msg) + ' message(s) sent' 
        print(log_str) 


