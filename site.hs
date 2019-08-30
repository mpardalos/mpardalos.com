--------------------------------------------------------------------------------
{-# LANGUAGE OverloadedStrings #-}
import           Data.Monoid (mappend)
import           Hakyll

siteName        = "_mike"
siteDescription = "Thoughts on haskell, programming, and whatever else comes to mind"
authorName      = "Michail Pardalos"
authorEmail     = "mpardalos@gmail.com"
siteUrl         = "https://mpardalos.xyz"

--------------------------------------------------------------------------------
main :: IO ()
main = hakyll $ do
    match "images/*" $ do
        route   idRoute
        compile copyFileCompiler

    match "css/*" $ compile compressCssCompiler
    create ["style.css"] $ do
        route idRoute
        compile $ do
            csses <- loadAll "css/*.css"
            makeItem $ unlines $ map itemBody csses

    match "pages/about.md" $ do
        route   $ gsubRoute "pages/" (const "") `composeRoutes` setExtension "html"
        compile $ pandocCompiler
            >>= loadAndApplyTemplate "templates/default.html" baseCtx
            >>= relativizeUrls

    match "pages/cv.pdf" $ do
        route   $ gsubRoute "pages/" (const "")
        compile $ copyFileCompiler

    match "posts/*" $ do
        route $ setExtension "html"
        compile $ pandocCompiler
            >>= loadAndApplyTemplate "templates/post.html"    postCtx
            >>= saveSnapshot "content"
            >>= loadAndApplyTemplate "templates/default.html" postCtx
            >>= relativizeUrls

    create ["atom.xml"] $ do
        route idRoute
        compile $ do
            let feedCtx = postCtx <> bodyField "description"

            allPosts <- loadAllSnapshots "posts/*" "content"
            recentPosts <- take 10 <$> recentFirst allPosts

            renderAtom feedConfiguration feedCtx recentPosts

    match "index.html" $ do
        route idRoute
        compile $ do
            posts <- recentFirst =<< loadAll "posts/*"
            let indexCtx =
                    listField "posts" postCtx (return posts) <>
                    constField "title" "Home" <>
                    baseCtx

            getResourceBody
                >>= applyAsTemplate indexCtx
                >>= loadAndApplyTemplate "templates/default.html" indexCtx
                >>= relativizeUrls

    match "templates/*" $ compile templateCompiler


--------------------------------------------------------------------------------
baseCtx :: Context String
baseCtx = defaultContext <> mconcat
  [ constField "site-name" siteName
  ]

postCtx :: Context String
postCtx = dateField "date" "%B %e, %Y" <> baseCtx

feedConfiguration :: FeedConfiguration
feedConfiguration = FeedConfiguration 
    { feedTitle       = siteName
    , feedDescription = siteDescription
    , feedAuthorName  = authorName
    , feedAuthorEmail = authorEmail
    , feedRoot        = siteUrl
    }
