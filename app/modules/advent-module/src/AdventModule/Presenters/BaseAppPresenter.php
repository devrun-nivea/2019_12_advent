<?php

namespace AdventModule\Presenters;

use AdventModule\Filters\CommonFilter;
use AdventModule\Forms\BaseForm;
use AdventModule\Forms\ILoginFormFactory;
use Devrun\CmsModule\Utils\Common;
use Devrun\ContestModule\Presenters\BaseContestPresenter;
use Nette;
use Tracy\Debugger;
use Tracy\ILogger;

/**
 * Base presenter for all application presenters.
 * @method onLoggedIn($user)
 */
class BaseAppPresenter extends BaseContestPresenter
{
    const SESSION_SECTION = 'questions';


    /** @var CommonFilter @inject */
    public $commonFilter;

    private $debug = false;

    protected $enableAjaxLayout = false;

    /** @var ILoginFormFactory @inject */
    public $loginFormFactory;

    /** @var array */
    public $onLoggedIn = [];

    protected $cacheImgs = [];

    /**
     * DI setter
     *
     * @param boolean $debug
     */
    public function setDebug($debug)
    {
        $this->debug = (bool) $debug;
    }

    /**
     * @return boolean
     */
    public function isDebug()
    {
        return $this->debug;
    }



    /**
     * @param $request
     * @param $response
     * @throws Nette\Application\AbortException
     */
    public function handleLog($request, $response)
    {
        Debugger::log($request, ILogger::DEBUG);
        Debugger::log($response, ILogger::DEBUG);

        $this->payload->ok = true;
        $this->sendPayload();
    }


    /**
     * ajax redirect
     *
     * @param string $uri
     * @param null $controlsToRedraw
     * @throws Nette\Application\AbortException
     */
    public function ajaxRedirectUrl($uri = 'this', $controlsToRedraw = null, $redrawAll = true)
    {
        if ($this->isAjax()) {
            $this->ajaxRedraw($controlsToRedraw, $redrawAll);

        } else {
            $this->redirectUrl($uri);
        }
    }


    private function ajaxRedraw($controlsToRedraw = null, $redrawAll = true)
    {
        if ($controlsToRedraw) {

            if (is_array($controlsToRedraw)) {
                foreach ($controlsToRedraw as $item) {

                    /** @var Nette\Application\UI\IRenderable $control */
                    if ($control instanceof Nette\Application\UI\IRenderable) {
                        $control = $this[$item];
                        $control->redrawControl();
                    }
                }

            } else {
                if (isset($this[$controlsToRedraw])) {
                    /** @var Nette\Application\UI\IRenderable $control */
                    $control = $this[$controlsToRedraw];
                    if ($control instanceof Nette\Application\UI\IRenderable) {
                        $control->redrawControl();
                    }
                }
            }
        }

        if ($redrawAll) $this->redrawControl();
    }



    protected function beforeRender()
    {
        parent::beforeRender();

        $this->template->production = $this->context->parameters['productionMode'];
//        $this->template->pageClass = trim("main-wrapper ajax-fade");

        if (Common::isAdminRequest() || Common::isPhantomRequest()) {
            $this->template->pageClass = trim("main-wrapper {$this->template->pageClass}");

        } else {
            $this->template->pageClass = trim("main-wrapper ajax-fade {$this->template->pageClass}");
        }



        /*
         * --------------------------------------------------------------------------------------------
         * Nivea proxy url settings
         */
        $proxyFrameBaseUrl = $this->commonFilter->getProxyUrl();

        $this->template->proxyBaseUrl = $this->commonFilter->getProxyUrl();
        if (isset($this->parameters['proxyBaseUrl'])) {
            $this->commonFilter->setProxyBaseUrl($this->parameters['proxyBaseUrl']);
            $this->template->proxyBaseUrl = $this->parameters['proxyBaseUrl'];
        }

        if ($proxyUrl = (isset($this->parameters['proxyUrl']) ? $this->parameters['proxyUrl'] : '')) {
            $this->setLayout(false);
            $proxyUrl .= "-";
        }

        /*
         * v maďarštině je potřeba nastavit prefix "/-" ale jen v neajaxovém dotazu a jen pokud se jedná o nivea.hu (existence HTTP_X_PF_BASEURL)
         */
        /*
        if ($this->translator->getLocale() == 'hu' && !$proxyUrl && $proxyFrameBaseUrl) {
            if (!$proxyUrl) {
                $proxyUrl = '/-';
            }
        }
        */

        $this->template->proxyUrl = $proxyUrl;



        $this->template->locale = $this->translator->getLocale();
        $this->template->allowLinks = $this->isRegistrationSend() == false;

//        $this->ajaxLayout();

    }


    protected function afterRender()
    {
        parent::afterRender();

        /** @var Nette\Bridges\ApplicationLatte\Template $template */
        $template = $this->getTemplate();

        $template->addFilter('hostLink', 'FrontModule\Filters\CommonFilter::hostLink');
        $template->addFilter('numberTwoDigits', 'FrontModule\Filters\CommonFilter::numberTwoDigits');
        $template->addFilter('proxyLink', array($this->commonFilter, 'proxyLink'));

        $template->isActive  = (date("j") <= 24) || $this->isDebug();
        $template->cacheImgs = $this->cacheImgs;

        $this->template->title = null;
        if ($routeId = $this->getRequest()->getParameter('routeId')) {
            if ($routeEntity = $this->routeRepository->find($routeId)) {
                $this->template->title = $routeEntity->title;
            }
        }

        if ($this->isNiveaAjax()) {
            $this->ajaxPageRender();
        }

    }


    /**
     * special ajax render
     * template will render to html payload and set pageClass
     * response will by switch to JSON instead TextResponse
     */
    protected function ajaxPageRender()
    {
        if ($this->isNiveaAjax()) {
            // save component tree persistent state
            $this->saveGlobalState();
            $this->payload->state = $this->getGlobalState();

            $template = $this->getTemplate();
            if (!$template->getFile()) {
                $files = $this->formatTemplateFiles();
                foreach ($files as $file) {
                    if (is_file($file)) {
                        $template->setFile($file);
                        break;
                    }
                }

                if (!$template->getFile()) {
                    $file = preg_replace('#^.*([/\\\\].{1,70})\z#U', "\xE2\x80\xA6\$1", reset($files));
                    $file = strtr($file, '/', DIRECTORY_SEPARATOR);
                    $this->error("Page not found. Missing template '$file'.");
                }
            }

            $this->payload->html = (string) $template;
            if ($this->template->title) $this->payload->title = $this->template->title;
            $this->payload->class = $this->template->pageClass;
            $this->sendPayload();
        }
    }





    public function flashMessage($message, $type = 'info', $title = '', array $options = array())
    {
        $id         = $this->getParameterId('flash');
        $messages   = $this->getPresenter()->getFlashSession()->$id;
        $messages[] = $flash = (object)array(
            'message' => $message,
            'title'   => $title,
            'type'    => $type,
            'options' => $options,
        );

        $this->getTemplate()->flashes = $messages;
        $this->getPresenter()->getFlashSession()->$id = $messages;
        return $flash;
    }

    /**
     * @todo odstraněna ochrana proti opětovnému odeslání
     *
     * @return bool
     */
    public function isRegistrationSend()
    {
        return false;

        $section = $this->getMySession();
        if (isset($section->registrationSend)) {
            return $section->registrationSend;
        }

        return false;
    }


    /**
     * @return bool
     */
    public function isNiveaAjax()
    {
        if ($proxyUrl = (isset($this->parameters['proxyUrl']) ? $this->parameters['proxyUrl'] : '')) {
            return $this->parameters['proxyUrl'];
        }

        return $this->isAjax();
    }


    public function getMySession()
    {
        $return = $this->getSession()->setName('pf_nivea')->getSection(self::SESSION_SECTION);
        return $return;
    }


    public function getSection($name = 'play')
    {
        return $this->getSession($name);
    }



    protected function createComponentLoginForm($name)
    {
        $form = $this->loginFormFactory->create();
        $form->setTranslator($this->translator->domain('forms.' . $name));

        $form->create();
        $form->bootstrap3Render();
        $form->getElementPrototype()->addAttributes([
            'class' => 'form-horizontal _ajax-form',
        ]);
        $form->onSuccess[] = function (BaseForm $form, $values) {

            $user = $this->getUser();
            try {
//                $result = $this->proCampaignAuthenticator->login($values['username'], $values['password']);

                $identity = $user->getIdentity();

//                $this->setRemainingPoints($identity->data);
                $this->onLoggedIn($user);

                $this->sendJson([
                    'authorization' => true,
                    'reason' => 'ok',
                ]);

            } catch (\Nette\Security\AuthenticationException $e) {
                Debugger::log('AuthenticationException ' . $e->getMessage(), 'log');

                if ($user->isLoggedIn()) {
                    $user->logout();
                }

                $form->addError('username_or_password_invalid');

                $this->sendJson([
                    'authorization' => false,
                    'reason' => $this->translator->translate('site.loginForm.username_or_password_invalid'),
                ]);

            }

        };

        return $form;
    }



}
