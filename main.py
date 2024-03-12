#!/usr/bin/env python3

import os 
import signal
from sys import exit
import datetime
import time
import json
import threading
from sys import stdout
import random
import math

import http_server

dir_path = os.path.dirname(os.path.realpath(__file__))
http_server.STATIC_DIR = os.path.join(dir_path, "public")

http_server.STATIC_DIR = "public"



def dump_to_console(*args):
	args = [str(a) for a in args]
	print("[MAIN]", " ".join(args))
	stdout.flush()

def get_control_json(state, count = 0):
	return json.dumps({
		"msg": "",
		"state": state,
		"count": count
		})



def main():
	import argparse

	# parser = argparse.ArgumentParser(description='Explora\'s Il buono prima di tutto controller' )
	# parser.add_argument('-t','--time',type=int, default=defaults.VIDEO_TIME,  help='Seconds on each round')
	# parser.add_argument('--socket', '-s', nargs='?', default='/tmp/display-server-socket') 
	# args = parser.parse_args()
	
	#START HTTP SERVER	
	http_server.start()
	dump_to_console("RAI Radio HTTP server started at port {}\non {}"\
		.format(http_server.PORT, datetime.datetime.now()))
	

	#HANDLE SIGTERM
	def close_sig_handler(signal, frame):
		dump_to_console("\nInterrupt signal received, cleaning up..")
		http_server.close()
		http_server.close()
		exit()

	signal.signal(signal.SIGINT, close_sig_handler)

if __name__ == '__main__':
	main()