#!/usr/bin/env python
# -*- coding: utf-8 -*- #
from __future__ import unicode_literals

AUTHOR = 'Michalis Pardalos'
SITENAME = '_mike'
SITEURL = 'mpardalos.xyz'
STATIC_PATHS = [
    'favicon.ico',
    'images/'
]

DISQUS_SITENAME = 'mpardalos'
GOOGLE_ANALYTICS = 'UA-124905673-1'

THEME = './themes/pelican-hyde'
PROFILE_IMAGE = 'profile.png'
MARKDOWN = {
    'extensions': ['emdash']
}

PATH = 'content'
TIMEZONE = 'Europe/London'
DEFAULT_LANG = 'en'

# Feed generation is usually not desired when developing
FEED_ALL_RSS = "rss.xml"

BIO = "Functional programming, programming languages and the ramblings of a madman"

SOCIAL = (('gitlab', 'https://gitlab.com/michalis_pardalos'),
          ('instagram', 'https://instagram.com/mpgrphoto'))

DEFAULT_PAGINATION = False

# Uncomment following line if you want document-relative URLs when developing
#RELATIVE_URLS = True
