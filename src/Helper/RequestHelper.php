<?php
/**
 * Created by PhpStorm.
 * User: ajeelomen-1
 * Date: 23/11/18
 * Time: 20:04
 */

namespace App\Helper;

use App\Entity\ResourceType;
use Doctrine\Common\Persistence\ManagerRegistry;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;

class RequestHelper
{
    /**
     * @var WAOHelper
     */
    private $waoHelper;
    /**
     * @var ManagerRegistry
     */
    private $doctrine;

    /**
     * ServerHelper constructor.
     * @param WAOHelper $waoHelper
     * @param ManagerRegistry $doctrine
     */
    public function __construct(WAOHelper $waoHelper,ManagerRegistry $doctrine)
    {
        $this->waoHelper = $waoHelper;
        $this->doctrine = $doctrine;
    }

    /**
     * check if get new request is valid and returns the data
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    public function handleGetNewRequest(Request $request)
    {
        $result = ["waoType"=>null];

        if (0 !== strpos($request->headers->get('Content-Type'), 'application/json')) {
            throw new \Exception("Request Content-Type must be application/json for GetNew request");
        }

        if(! $request->query->has("type")) throw new \Exception("Type parameter is mandatory for Get New request");
        $dtoClassName = $this->waoHelper->guessClassName($request->query->get("type"));
        if(! $this->waoHelper->isDTO($dtoClassName))
            throw new \Exception($request->query->has("type") . " is not a known DTO");

        $result["waoType"] = $request->query->get("type");

        return $result;
    }

    /**
     * check if post request is valid and returns the data
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    public function handlePostRequest(Request $request)
    {
        $result = ["senderKey"=>null,"waos"=>[]];
        if (0 !== strpos($request->headers->get('Content-Type'), 'application/json')) {
            throw new \Exception("Request Content-Type must be application/json for Post request");
        }
        /** @var array $data */
        $data = json_decode($request->getContent(), true);
        if(!$data) throw new \Exception("Post request data is null");
        if(! array_key_exists("senderKey",$data)) throw new \Exception("senderKey attribute is mandatory for Post data");
        if(! array_key_exists("_token",$data)) throw new \Exception("_token attribute is mandatory for Post data");
        if(! array_key_exists("waos",$data)) throw new \Exception("waos attribute is mandatory for Post data");
        if(! is_array($data["waos"])) throw new \Exception("waos attribute must be an associative array");

        $result["_token"] = $data["_token"];
        $result["senderKey"] = $data["senderKey"];
        $result["waos"] = $data["waos"];

        foreach($result["waos"] as $waoType => $waoData){
            if(! $this->waoHelper->isDTO($this->waoHelper->guessClassName($waoType)))
                throw new \Exception($waoType . " is not a known DTO");
            if(! is_array($waoData))
                throw new \Exception("waos.". $waoType . " must be an associative array of entities keyed by their ids");
            foreach($waoData as $id => $value){
                if(!is_integer($id))
                    throw new \Exception("waos.". $waoType . "'s id '". $id . "' is not an integer");
                if(!is_array($value))
                    throw new \Exception("waos.". $waoType . "'s data is not an associative array [property=>value]");
                if(!array_key_exists("postedGroups",$value))
                    throw new \Exception("waos.". $waoType . "'s data must have a 'postedGroups' property");
            }
        }
        return $result;
    }

    /**
     * check if upload request is valid and returns the data
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    public function handleUploadRequest(Request $request)
    {
        $result = [
            "senderKey"=>null,
            "file"=>null,
            "name"=>null,
            "contentType"=>null,
            "resourceType"=>null,
            "resourceId"=>null,
            "_token" => null
        ];

        $result["senderKey"] = $request->get("senderKey");
        $result["file"] = $request->getContent();
        $result["name"] = $request->get("name");
        $result["contentType"] = $request->get("contentType");
        $result["resourceType"] = $request->get("resourceType");
        $result["resourceId"] = $request->get("resourceId");
        $result["_token"] = $request->get("_token");

        if(!$result["file"]) throw new \Exception("No file sent in Upload request");
        if(!$result["name"] || in_array($result["name"],["","null"]) )
            throw new \Exception("name attribute is mandatory for Upload request");
        if(!$result["contentType"] || in_array($result["contentType"],["","null"]) )
            throw new \Exception("contentType attribute is mandatory for Upload request");
        if(!$result["resourceType"] || in_array($result["resourceType"],["","null"]) )
            throw new \Exception("resourceType attribute is mandatory for Upload request");

        $resourceType = $this->doctrine->
        getRepository(ResourceType::class)->find(intval($result["resourceType"]));
        if(!$resourceType)
            throw new \Exception("Unknown resourceType of id'" . $result["resourceType"] . "'");
        $result["resourceType"] = $resourceType;

        $acceptableContentTypes=[ResourceType::IMAGE=>['image/bmp','image/jpeg','image/png','image/gif']];
        if(!in_array($result["contentType"],$acceptableContentTypes[$resourceType->getId()])){
            throw new \Exception("HTTP ContentType '" . $result["contentType"] .
                "' is not allowed for resourceType '". $resourceType->getLabel() ."'");
        }

        if(!$result["resourceId"] || in_array($result["resourceId"],["","null"]) )
            $result["resourceId"] = null;
        if(!$result["senderKey"] || in_array($result["senderKey"],["","null"]) )
            $result["senderKey"] = null;

        // if all ok let's copy the file content to an uploaded file
        $temp = tmpfile();
        fwrite($temp,$result["file"]);
        $meta = stream_get_meta_data($temp);
        copy($meta['uri'],$meta['uri']."_"); // to prevent temp file removing
        $uploadedFile = new UploadedFile($meta['uri']."_",$result["name"]);
        $result["file"] = $uploadedFile;


        return $result;
    }

    /**
     * check if register request is valid and returns the data
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    public function handleRegisterRequest(Request $request)
    {
        $result = [
            "senderKey"=>null,
            "email" => null,
            "password" => null,
            "_token" => null
        ];

        if (0 !== strpos($request->headers->get('Content-Type'), 'application/json')) {
            throw new \Exception("Request Content-Type must be application/json for Register request");
        }
        /** @var array $data */
        $data = json_decode($request->getContent(), true);
        if(!$data) throw new \Exception("Post request data is null");
        if(! array_key_exists("senderKey",$data)) throw new \Exception("senderKey attribute is mandatory for Register data");
        if(! array_key_exists("_token",$data)) throw new \Exception("_token attribute is mandatory for Register data");
        if(! array_key_exists("email",$data)) throw new \Exception("email attribute is mandatory for Register data");
        if(! array_key_exists("password",$data)) throw new \Exception("password attribute is mandatory for Register data");

        $result["_token"] = $data["_token"];
        $result["senderKey"] = $data["senderKey"];
        $result["email"] = $data["email"];
        $result["password"] = $data["password"];

        return $result;
    }

    /**
     * check if login request is valid and returns the data
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    public function handleLoginRequest(Request $request)
    {
        $result = [
            "senderKey"=>null,
            "email" => null,
            "password" => null,
            "_token" => null
        ];

        if (0 !== strpos($request->headers->get('Content-Type'), 'application/json')) {
            throw new \Exception("Request Content-Type must be application/json for Login request");
        }
        /** @var array $data */
        $data = json_decode($request->getContent(), true);
        if(!$data) throw new \Exception("Post request data is null");
        if(! array_key_exists("senderKey",$data)) throw new \Exception("senderKey attribute is mandatory for Login data");
        if(! array_key_exists("_token",$data)) throw new \Exception("_token attribute is mandatory for Login data");
        if(! array_key_exists("login",$data)) throw new \Exception("login attribute is mandatory for Login data");
        if(! array_key_exists("password",$data)) throw new \Exception("password attribute is mandatory for Login data");

        $result["_token"] = $data["_token"];
        $result["senderKey"] = $data["senderKey"];
        $result["login"] = $data["login"];
        $result["password"] = $data["password"];

        return $result;
    }

    /**
     * check if askPasswordRecovery request is valid and returns the data
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    public function handleAskPasswordRecoveryRequest(Request $request)
    {
        $result = [
            "senderKey"=>null,
            "login" => null,
            "_token" => null
        ];

        if (0 !== strpos($request->headers->get('Content-Type'), 'application/json')) {
            throw new \Exception("Request Content-Type must be application/json for AskPasswordRecovery request");
        }
        /** @var array $data */
        $data = json_decode($request->getContent(), true);
        if(!$data) throw new \Exception("Post request data is null");
        if(! array_key_exists("senderKey",$data)) throw new \Exception("senderKey attribute is mandatory for AskPasswordRecovery data");
        if(! array_key_exists("_token",$data)) throw new \Exception("_token attribute is mandatory for AskPasswordRecovery data");
        if(! array_key_exists("login",$data)) throw new \Exception("email attribute is mandatory for AskPasswordRecovery data");

        $result["_token"] = $data["_token"];
        $result["senderKey"] = $data["senderKey"];
        $result["login"] = $data["login"];

        return $result;
    }

    /**
     * check if changePassword request is valid and returns the data
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    public function handleChangePasswordRequest(Request $request)
    {
        $result = [
            "senderKey"=>null,
            "_token" => null,
            "email" => null,
            "password" => null
        ];

        if (0 !== strpos($request->headers->get('Content-Type'), 'application/json')) {
            throw new \Exception("Request Content-Type must be application/json for AskPasswordRecovery request");
        }
        /** @var array $data */
        $data = json_decode($request->getContent(), true);
        if(!$data) throw new \Exception("Post request data is null");
        if(! array_key_exists("senderKey",$data)) throw new \Exception("senderKey attribute is mandatory for ChangePassword data");
        if(! array_key_exists("_token",$data)) throw new \Exception("_token attribute is mandatory for ChangePassword data");
        if(! array_key_exists("email",$data)) throw new \Exception("email attribute is mandatory for ChangePassword data");
        if(! array_key_exists("password",$data)) throw new \Exception("password attribute is mandatory for ChangePassword data");
        if(! array_key_exists("isAlreadyAuthenticated",$data)) throw new \Exception("isAlreadyAuthenticated attribute is mandatory for ChangePassword data");
        if(! array_key_exists("token",$data)) throw new \Exception("token attribute is mandatory for ChangePassword data");

        $result["_token"] = $data["_token"];
        $result["senderKey"] = $data["senderKey"];
        $result["email"] = $data["email"];
        $result["password"] = $data["password"];
        $result["isAlreadyAuthenticated"] = $data["isAlreadyAuthenticated"];
        $result["token"] = $data["token"];

        return $result;
    }

    /**
     * check if contact request is valid and returns the data
     * @param Request $request
     * @return array
     * @throws \Exception
     */
    public function handleContactRequest(Request $request)
    {
        $result = [
            "senderKey"=>null,
            "type" => null,
            "subject" => null,
            "message" => null,
            "_token" => null
        ];

        if (0 !== strpos($request->headers->get('Content-Type'), 'application/json')) {
            throw new \Exception("Request Content-Type must be application/json for Login request");
        }
        /** @var array $data */
        $data = json_decode($request->getContent(), true);
        if(!$data) throw new \Exception("Post request data is null");
        if(! array_key_exists("senderKey",$data)) throw new \Exception("senderKey attribute is mandatory for Contact data");
        if(! array_key_exists("_token",$data)) throw new \Exception("_token attribute is mandatory for Contact data");
        if(! array_key_exists("type",$data)) throw new \Exception("type attribute is mandatory for Contact data");
        if(! array_key_exists("subject",$data)) throw new \Exception("subject attribute is mandatory for Contact data");
        if(! array_key_exists("message",$data)) throw new \Exception("message attribute is mandatory for Contact data");

        $result["_token"] = $data["_token"];
        $result["senderKey"] = $data["senderKey"];
        $result["type"] = $data["type"];
        $result["subject"] = $data["subject"];
        $result["message"] = $data["message"];

        return $result;
    }
}