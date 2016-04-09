import { jsdom } from 'jsdom';

global.document = jsdom('<!DOCTYPE HTML><html><body></body></html>');
global.window = document.defaultView;
