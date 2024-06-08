# TREM Wealthy Place Quiz Website - 2024

## ABOUT:

This simple quiz application is one that assists quiz mastsers in holding a quiz event effectively. It does this by:

-   Handling tie breaks when needed
-   Displaying all available questions
-   Keeping track of contestants turns
-   Optionally timing a question
-   Keeping track of answered/unanswered questions
-   Displaying a scoreboard that shows quiz contestants' scores
-   Properly displaying each picked questions (and answer) for quiz contestants and the observers to see.

## OPERATION:

Unlike the previous version (1.0.0) that just required opening the (now non-existent) `index.html` file in any browser of your choice, this new version comes with a need for a server to be set up. We have used PHP as a means to set up this server. Follow the steps on this [website](https://www.geeksforgeeks.org/how-to-install-php-in-windows-10/) to install PHP on your Windows PC. If you are following the tutorial on that [website](https://www.geeksforgeeks.org/how-to-install-php-in-windows-10/), you can optionally use the [zip file](./php-8.2.9-nts-Win32-vs16-x64.zip) in this folder (if available and **IF YOUR SYSTEM IS OF 64-BIT ARCHITECTURE**) to continue with the remaining installation steps instead of downloading the [zip file](./php-8.2.9-nts-Win32-vs16-x64.zip) again from [PHP's official downloads website](https://www.php.net/downloads). It is recommended that you do not download a beta version of PHP.

Once you have followed the tutorial through and have installed PHP, you can start the quiz application on Windows by opening a Command Prompt in the root of this folder. Afterwards, type the following:

```cmd
php -S localhost:8000
```

Then, open any browser of your choice and type `localhost:8000/index/index.html` into the address bar. That's it, your quiz application is up and running!

## VERISONS:

1.0.0 Release date: 01-03-2023:

-   Initial single page release

2.0.0 Release date: 19-08-2023:

-   Multi-page implementation
-   Various optimizations

3.0.0 Release date: 14-05-2024:

-   Fixed Contestants' selection bug
-   Added Admin page, eliminating the need for manual file configuration which is prone to error
-   Added Pardon points system

3.1.0 Release date: 28-05-2024:

-   Added Pardon Points system
-   Implemented easier system of adding questions
-   Added Questions and Contestants swapping system
-   Scoreboard now shows Round points alongside Lumped Points
-   Updated visual implementation of timer
-   Various optimizations and bug fixes
-   Deployed to a website

## AUTHOR(S):

TREM Wealthy Place Media Ministry ©2023-2024.
