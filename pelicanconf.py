#!/usr/bin/env python
# -*- coding: utf-8 -*- #
from __future__ import unicode_literals

AUTHOR = 'Michalis Pardalos'
SITENAME = '_mike'
SITEURL = ''

THEME = './themes/pelican-hyde'
PROFILE_IMAGE = 'profile.png'
MARKDOWN = {
    'extensions': ['emdash']
}

PATH = 'content'

TIMEZONE = 'Europe/London'

DEFAULT_LANG = 'en'

BIO = "Functional programming, programming languages and the ramblings of a madman"

# Feed generation is usually not desired when developing
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None

# Blogroll
LINKS = (('Pelican', 'http://getpelican.com/'),
         ('Python.org', 'http://python.org/'),
         ('Jinja2', 'http://jinja.pocoo.org/'))

# Social widget
SOCIAL = (('gitlab', 'https://gitlab.com/michalis_pardalos'),
          ('instagram', 'https://instagram.com/mpgrphoto'))

DEFAULT_PAGINATION = False

# Uncomment following line if you want document-relative URLs when developing
#RELATIVE_URLS = True
