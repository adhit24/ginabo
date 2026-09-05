---
updatedAt: 2026-04-28T11:51:46.000Z
---

Fetch the complete documentation index at: https://docs.midtrans.com/llms.txt. Use this file to discover all available pages before exploring further.

# Account Overview

Before integrating with Midtrans, you need to register for Account.

## Register Midtrans Account

Start by creating an account [here](dashboard.midtrans.com/register). You will need a valid email address and phone number in order to create an account.

<br />

<Image align="center" alt={1096} caption="Production Merchant Dashboard" title="production-map.png" src="https://files.readme.io/a05f86f-production-map.png" />

<br />

Once you're in, complete your registration process via the pop up shown - see here for a detailed guide and video tutorial ([ID](https://midtrans.com/id/passport), [EN](https://midtrans.com/passport)).

<br />

***

## Accessing Midtrans Administration Portal

<br />

To access Midtrans Administration Portal (MAP), follow the steps given below.

1. Click **Login** on Midtrans website ([www.midtrans.com](http://www.midtrans.com)).\
   You are redirected to the *LOGIN* page.

2. Enter your **Email**.

3. Enter **Password**.

4. Click **Log me in**.

<br />

<Image align="center" alt="Login page" caption="Login page" src="https://files.readme.io/a54051a-small-Login_Page_MAP.png" width="750px" />

<br />​

Upon successful login, *Dashboard* is displayed.

<br />

> 📘 Keeping your account secure
>
> * If your session is inactive for more than 15 minutes, you will be logged out automatically.
> * You will be prompted to update your Midtrans Dashboard's password every 180 days.

<br />

***

<br />

## Completing Account Information

<br />

Complete the required information from [**Settings > General Settings**](https://dashboard.sandbox.midtrans.com/settings/general_info).

<br />

<Image align="center" alt={1260} caption="General Information" title="snap-prep-general-setting.png" src="https://files.readme.io/4f00480-snap-prep-general-setting.png" />

<br />

> 📘 Note
>
> * Merchant Name can not contain any symbols.
> * Merchant URL should be less than 25 characters.

<br />

***

<br />

## Retrieving API Access Keys

<br />

To communicate with the Midtrans API, Client Key and Server Key are required.

To get access to the Client Key and Server Key, follow the steps given below.

1. Login to your MAP account.

2. On the *Dashboard*, go to **Settings > Access Keys**.

   *Access Keys* page is displayed.

<br />

![](https://files.readme.io/9dc5d02-snap-prep-access-keys.png "snap-prep-access-keys.png")

<br />

> 📘 Note
>
> * `Client Key`: Used as API key to be used for authorization on **frontend** API request/configuration. So it safe to put in your HTML / client code publicly.
> * `Server Key`: Used as API key to be used for authorization while calling Midtrans API from **backend**. So **keep it confidential**.

<br />

<Callout icon="❗️" theme="error">
  Access Keys are unique for every merchant. **Always keep Server Key confidential**.
</Callout>

<br />

***

<br />

## Switching Environment

<br />

Environment can be switched from the top left **Environment** drop-down on the dashboard.

<br />

<Image align="center" alt={812} caption="Environment Switch" title="snap-prep-env-switch.png" src="https://files.readme.io/05ccba8-snap-prep-env-switch.png" />

<br />

You can use the Sandbox environment during your development phase of integrating Midtrans’ payment system. You can also test dummy transactions on the Sandbox environment.

<br />

<Image align="center" alt={934} caption="Environment Difference" title="snap-prep-env-diff.jpeg" src="https://files.readme.io/69b1cc7-snap-prep-env-diff.jpeg" />

<br />

* **Sandbox Environment**: Can be used to create "testing" transactions (usually performed from your development/testing environment). All transaction made within this environment mode is not "real", and does not require "real payment/fund". You can simulate a test-payment [via Sandbox Simulator](/docs/testing-payment-on-sandbox) to change the payment status, as if it has been paid. This environment is created automatically when you are signing up, and free to use.

<br />

* **Production Environment**: Can be used when you are ready to accept "real payment/fund" from your customer. Customer will need to make a real payment to trigger the payment status update. Transaction fee may apply to any payment created in this environment mode.

<br />

API Keys between **Production & Sandbox** environment are different. Please make sure to access correct dashboard environment.

Transaction data are separated between each environments, so it will not interfere/get mixed with each other. Settings & configurations are mostly separated between each environments, so you can have two different settings for testing and production mode.

<br />

***

<br />

## Unlocking Locked Account

<br />

If you try to login to your account with a wrong password more than five times, your account is automatically locked. This is a safety feature to protect your account from any illegitimate access.

Once your account is locked, it will be automatically unlocked after 15 minutes.

If you are not able to unlock your account after 15 minutes, please inform <support@midtrans.com> to begin the unlock process. Once the account is unlocked, please log in to Midtrans MAP account using your existing password.

<br />

***

<br />

## Resetting the Password

<br />

In case you forget the password, you can reset your password with a new one.

To reset your password, follow the steps given below.

1. On the Login page, click **Forgot your password?**.

<br />

<Image align="center" alt="Forgot Password Page" caption="Forgot Password Page" src="https://files.readme.io/47d2cf4-small-forgot-password-MAP.png" width="500px" />

<br />

You are redirected to *Reset Password* page.

2. Enter your registered email in the **Email** field.
3. Click **Send link**.

<br />

<Image align="center" alt="Forgot Password Page" caption="Forgot Password Page" src="https://files.readme.io/ff41963-small-email-reset-password.png" width="500px" />

<br />

A message confirming a link will be sent via email to reset your password is displayed. Please check your *Inbox* and *Spam* folder.

4. Go to your email account and open the auto-generated email received in your inbox.

5. Click the link to reset your password.

6. You are redirected to the Midtrans **Change Password** page.

7. Enter a new password in the **New Password** field.

8. Re-enter the same password in the **Confirm New Password** field.

9. Click **Change My Password**.

   Upon successful password reset, you are redirected to Midtrans Login page.

<br />

> 📘 Notes
>
> * The *Forgot password* link in the email is only valid for one hour. If the link expires, repeat the password reset process.
> * The new password can not be same as the password used in the past.

<br />