<?php

namespace App\Helper;

use Symfony\Component\Form\FormError;
use Symfony\Component\Form\FormErrorIterator;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use App\Factory\JsonResponseFactory;

/**
 * Class FormErrorHelper
 * @package App\Helper
 */
class FormErrorHelper
{
    protected $jsonResponseFactory;

    public function __construct(JsonResponseFactory $jsonResponseFactory)
    {
        $this->jsonResponseFactory = $jsonResponseFactory;
    }

    /**
     * @param FormErrorIterator $formErrorIterator
     *
     * @return array
     */
    private function getError(FormErrorIterator $formErrorIterator):array
    {

        $message = [];
        foreach ($formErrorIterator as $formError) {
            /**
             * @var FormError $formError
             */
            $message[$formError->getOrigin()->getName()] = $formError->getMessage();
        }

        return $message;
    }

    /**
     * @param FormErrorIterator $formErrorIterator
     *
     * @return JsonResponse
     */
    public function getJsonResponse(FormErrorIterator $formErrorIterator):JsonResponse
    {
        return $this->jsonResponseFactory->create(
            ['errorMessage' => $this->getError($formErrorIterator)],
            Response::HTTP_BAD_REQUEST
        );
    }
}
